import { pgTable, serial, text, real, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const plotsTable = pgTable("plots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  areRai: real("are_rai").notNull(),
  treeCount: integer("tree_count").notNull(),
  variety: text("variety").notNull(),
  treeAge: integer("tree_age").notNull(),
  plantedDate: date("planted_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlotSchema = createInsertSchema(plotsTable).omit({ id: true, createdAt: true });
export type InsertPlot = z.infer<typeof insertPlotSchema>;
export type Plot = typeof plotsTable.$inferSelect;
