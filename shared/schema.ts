import { pgTable, text, serial, integer, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  classLevel: text("class_level"), // e.g., "M.1/1"
  studentNumber: integer("student_number"),
  points: integer("points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goodnessRecords = pgTable("goodness_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  description: text("description").notNull(),
  datePerformed: date("date_performed").notNull(),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  pointsAwarded: integer("points_awarded").default(0),
  adminFeedback: text("admin_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  goodnessRecords: many(goodnessRecords),
}));

export const goodnessRecordsRelations = relations(goodnessRecords, ({ one }) => ({
  user: one(users, {
    fields: [goodnessRecords.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, points: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertGoodnessRecordSchema = createInsertSchema(goodnessRecords).omit({ id: true, userId: true, status: true, pointsAwarded: true, adminFeedback: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type GoodnessRecord = typeof goodnessRecords.$inferSelect;
export type InsertGoodnessRecord = z.infer<typeof insertGoodnessRecordSchema>;

// API Payloads

export type LoginRequest = {
  username: string;
  password: string;
};

export type CreateGoodnessRecordRequest = InsertGoodnessRecord;
export type UpdateGoodnessRecordStatusRequest = {
  status: "approved" | "rejected";
  pointsAwarded?: number;
  adminFeedback?: number;
};

// Response types
export type UserResponse = User;
export type AnnouncementResponse = Announcement;
export type GoodnessRecordResponse = GoodnessRecord & { user?: User };
