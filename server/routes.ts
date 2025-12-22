import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import MemoryStore from "memorystore";

const scryptAsync = promisify(scrypt);

const SessionStore = MemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Auth Setup ===
  app.use(session({
    store: new SessionStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 } // 1 day
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false, { message: "Incorrect username." });
      
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) return done(null, false, { message: "Incorrect password." });
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Middleware to check auth
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && (req.user as any).role === "admin") return next();
    res.status(403).json({ message: "Forbidden" });
  };

  // === Routes ===

  // Auth
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) return res.json(req.user);
    res.status(401).json({ message: "Unauthorized" });
  });

  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const input = api.auth.signup.input.parse(req.body);
      
      // Check if user already exists
      const existing = await storage.getUserByUsername(input.username);
      if (existing) return res.status(400).json({ message: "Username already exists" });
      
      // Hash password and create user
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        username: input.username,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        classLevel: input.classLevel,
        studentNumber: input.studentNumber,
        role: "student",
      });
      
      // Automatically log in the new user
      req.logIn(user, (err) => {
        if (err) return res.status(500).json({ message: "Error logging in" });
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // Users (Admin only to list/edit usually, but we'll allow listing for now if needed, or stick to admin)
  app.get(api.users.list.path, requireAdmin, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.put(api.users.update.path, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateUser(id, req.body);
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  });

  // Announcements (Public read, Admin write)
  app.get(api.announcements.list.path, async (req, res) => {
    const announcements = await storage.getAnnouncements();
    res.json(announcements);
  });

  app.post(api.announcements.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.announcements.create.input.parse(req.body);
      const announcement = await storage.createAnnouncement(input);
      res.status(201).json(announcement);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put(api.announcements.update.path, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateAnnouncement(id, req.body);
    if (!updated) return res.status(404).json({ message: "Announcement not found" });
    res.json(updated);
  });

  app.delete(api.announcements.delete.path, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteAnnouncement(id);
    res.status(204).end();
  });

  // Goodness Records
  app.get(api.goodness.list.path, requireAuth, async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const status = req.query.status as string;
    
    // Students can only see their own
    if ((req.user as any).role !== "admin" && userId !== (req.user as any).id && userId !== undefined) {
      // If student requests someone else's data -> forbid.
      // If student requests no userId -> default to them? Or show all? The UI says "Show history". 
      // Let's enforce: if not admin, force userId = current user.
    }
    
    const effectiveUserId = (req.user as any).role === "admin" ? userId : (req.user as any).id;
    const records = await storage.getGoodnessRecords(effectiveUserId, status);
    res.json(records);
  });

  app.post(api.goodness.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.goodness.create.input.parse(req.body);
      const record = await storage.createGoodnessRecord({
        ...input,
        userId: (req.user as any).id
      });
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch(api.goodness.review.path, requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status, pointsAwarded, adminFeedback } = req.body;
    
    const record = await storage.getGoodnessRecord(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    // Update record
    const updatedRecord = await storage.updateGoodnessRecord(id, { status, pointsAwarded, adminFeedback });

    // If approved and points awarded, update user points
    if (status === "approved" && pointsAwarded && record.userId) {
       const user = await storage.getUser(record.userId);
       if (user) {
         await storage.updateUser(user.id, { points: (user.points || 0) + pointsAwarded });
       }
    }

    res.json(updatedRecord);
  });

  // Seed Data
  if ((await storage.getUsers()).length === 0) {
    const hashedAdminPwd = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password: hashedAdminPwd,
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      classLevel: "Staff",
      studentNumber: 0,
      points: 0
    });

    const hashedStudentPwd = await hashPassword("student123");
    await storage.createUser({
      username: "student",
      password: hashedStudentPwd,
      role: "student",
      firstName: "Somchai",
      lastName: "Dee",
      classLevel: "M.1/1",
      studentNumber: 101,
      points: 0
    });
    
    await storage.createAnnouncement({
      title: "Welcome to Student Council",
      content: "This is the first announcement. Welcome everyone!",
      imageUrl: "https://placehold.co/600x400"
    });
  }

  return httpServer;
}
