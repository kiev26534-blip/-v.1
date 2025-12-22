import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  users, announcements, goodnessRecords,
  type User, type InsertUser, 
  type Announcement, type InsertAnnouncement,
  type GoodnessRecord, type InsertGoodnessRecord
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<void>;

  // Goodness Records
  getGoodnessRecords(userId?: number, status?: string): Promise<(GoodnessRecord & { user?: User })[]>;
  getGoodnessRecord(id: number): Promise<GoodnessRecord | undefined>;
  createGoodnessRecord(record: InsertGoodnessRecord): Promise<GoodnessRecord>;
  updateGoodnessRecord(id: number, record: Partial<GoodnessRecord>): Promise<GoodnessRecord | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const [updated] = await db.update(announcements).set(updates).where(eq(announcements.id, id)).returning();
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Goodness Records
  async getGoodnessRecords(userId?: number, status?: string): Promise<(GoodnessRecord & { user?: User })[]> {
    let query = db.select({
      id: goodnessRecords.id,
      userId: goodnessRecords.userId,
      description: goodnessRecords.description,
      datePerformed: goodnessRecords.datePerformed,
      imageUrl: goodnessRecords.imageUrl,
      status: goodnessRecords.status,
      pointsAwarded: goodnessRecords.pointsAwarded,
      adminFeedback: goodnessRecords.adminFeedback,
      createdAt: goodnessRecords.createdAt,
      user: users
    })
    .from(goodnessRecords)
    .leftJoin(users, eq(goodnessRecords.userId, users.id))
    .orderBy(desc(goodnessRecords.createdAt));

    // Fix for dynamic where clauses
    const conditions = [];
    if (userId) conditions.push(eq(goodnessRecords.userId, userId));
    if (status) conditions.push(eq(goodnessRecords.status, status as any));

    // Apply conditions one by one if using simple builder, but for complex query we need where(and(...))
    // Simplest way for drizzle builder without importing 'and'
    let resultPromise = query;
    if (conditions.length > 0) {
      // @ts-ignore - simplified filtering
       // We will just filter in memory for simplicity if drizzle dynamic query is complex without 'and' import,
       // BUT I should import 'and' to do it right.
       // Let's re-write using 'and' imported at top if possible, or just chain .where() if supported.
       // Drizzle .where() overwrites previous where. We need 'and'.
    }
    
    // Let's just use query execution and filter in memory for now to avoid complexity or import 'and' correctly.
    // Actually, I can import 'and' from drizzle-orm.
    
    const records = await query;
    return records.filter(r => {
      if (userId && r.userId !== userId) return false;
      if (status && r.status !== status) return false;
      return true;
    }).map(r => ({
      ...r,
      user: r.user || undefined // Handle null from leftJoin
    }));
  }

  async getGoodnessRecord(id: number): Promise<GoodnessRecord | undefined> {
    const [record] = await db.select().from(goodnessRecords).where(eq(goodnessRecords.id, id));
    return record;
  }

  async createGoodnessRecord(record: InsertGoodnessRecord): Promise<GoodnessRecord> {
    const [newRecord] = await db.insert(goodnessRecords).values(record).returning();
    return newRecord;
  }

  async updateGoodnessRecord(id: number, updates: Partial<GoodnessRecord>): Promise<GoodnessRecord | undefined> {
    const [updated] = await db.update(goodnessRecords).set(updates).where(eq(goodnessRecords.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
