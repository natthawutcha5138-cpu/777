import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const notificationsTable = pgTable("notifications", {
  id:           serial("id").primaryKey(),
  userId:       integer("user_id").notNull(),
  type:         text("type").notNull(), // task_overdue | low_stock | maintenance_due | weather_alert | system
  title:        text("title").notNull(),
  body:         text("body").notNull(),
  severity:     text("severity").notNull().default("info"), // info | warning | urgent
  read:         boolean("read").notNull().default(false),
  relatedPath:  text("related_path"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({
  id: true, createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
