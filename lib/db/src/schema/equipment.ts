import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const equipmentTable = pgTable("equipment", {
  id:                  serial("id").primaryKey(),
  userId:              integer("user_id").notNull(),
  name:                text("name").notNull(),
  type:                text("type").notNull(), // รถไถ | เครื่องพ่นยา | ระบบน้ำ | เครื่องตัดหญ้า | อื่นๆ
  status:              text("status").notNull().default("operational"), // operational | maintenance | broken | retired
  purchaseDate:        date("purchase_date", { mode: "string" }),
  lastMaintenanceDate:  date("last_maintenance_date", { mode: "string" }),
  nextMaintenanceDate:  date("next_maintenance_date", { mode: "string" }),
  notes:               text("notes"),
  createdAt:           timestamp("created_at").defaultNow().notNull(),
});

export const insertEquipmentSchema = createInsertSchema(equipmentTable, {
  purchaseDate: z.string().optional(),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
}).omit({ id: true, createdAt: true });
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipmentTable.$inferSelect;
