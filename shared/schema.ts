import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profilePicture: text("profile_picture"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  profilePicture: true,
});

// Plants table
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species"),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  wateringFrequency: integer("watering_frequency").notNull(), // in days
  lightNeeds: text("light_needs").notNull(),
  lastWatered: timestamp("last_watered"),
  notes: text("notes"),
  userId: integer("user_id"), // For future multi-user support
});

export const insertPlantSchema = createInsertSchema(plants).omit({
  id: true,
  userId: true,
  lastWatered: true,
});

// Care tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // watering, fertilizing, pruning, etc.
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false),
  userId: integer("user_id"), // For future multi-user support
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
});

// Activity logs table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id"),  // Allow null for system-wide activities
  type: text("type").notNull(), // watering, fertilizing, pruning, SENSOR_ALERT, VOICE_QUERY, etc.
  timestamp: timestamp("timestamp").notNull(),
  description: text("description").notNull(), // Human-readable description
  date: text("date").notNull(), // ISO string date for easier querying
  notes: text("notes"),
  metadata: jsonb("metadata"), // Store additional data like sensor readings
  userId: integer("user_id"), // For future multi-user support
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  userId: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
