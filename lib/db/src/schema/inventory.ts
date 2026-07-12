import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryItemsTable = pgTable("inventory_items", {
  id:           serial("id").primaryKey(),
  userId:       integer("user_id").notNull(),
  name:         text("name").notNull(),
  category:     text("category").notNull(), // ปุ๋ย | สารเคมี | อุปกรณ์ | อะไหล่
  unit:         text("unit").notNull(), // กก. | ลิตร | ชิ้น | ถุง
  quantity:     real("quantity").notNull().default(0),
  minQuantity:  real("min_quantity").notNull().default(0),
  costPerUnit:  real("cost_per_unit").notNull().default(0),
  supplier:     text("supplier"),
  notes:        text("notes"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItemsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItemsTable.$inferSelect;
