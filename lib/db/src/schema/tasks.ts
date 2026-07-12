import { pgTable, serial, text, integer, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tasksTable = pgTable("tasks", {
  id:            serial("id").primaryKey(),
  userId:        integer("user_id").notNull(),
  title:         text("title").notNull(),
  description:   text("description"),
  status:        text("status").notNull().default("todo"), // todo | in_progress | done
  priority:      text("priority").notNull().default("medium"), // low | medium | high | urgent
  category:      text("category"), // ให้น้ำ | ให้ปุ๋ย | พ่นยา | เก็บเกี่ยว | ซ่อมบำรุง | อื่นๆ
  plotId:        integer("plot_id"),
  workerId:      integer("worker_id"),
  dueDate:       date("due_date", { mode: "string" }),
  completedAt:   timestamp("completed_at"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasksTable, {
  dueDate: z.string().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
