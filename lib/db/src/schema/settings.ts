import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const orgSettingsTable = pgTable("org_settings", {
  id:           serial("id").primaryKey(),
  userId:       integer("user_id").notNull().unique(),
  orgName:      text("org_name").notNull().default(""),
  farmName:     text("farm_name").notNull().default(""),
  language:     text("language").notNull().default("th"),
  timezone:     text("timezone").notNull().default("Asia/Bangkok"),
  notifyEmail:  boolean("notify_email").notNull().default(true),
  notifyPush:   boolean("notify_push").notNull().default(true),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

export const updateOrgSettingsSchema = createInsertSchema(orgSettingsTable).omit({
  id: true, userId: true, updatedAt: true,
}).partial();
export type UpdateOrgSettings = z.infer<typeof updateOrgSettingsSchema>;
export type OrgSettings = typeof orgSettingsTable.$inferSelect;
