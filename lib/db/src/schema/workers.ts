import { pgTable, serial, text, integer, real, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workersTable = pgTable("workers", {
  id:         serial("id").primaryKey(),
  userId:     integer("user_id").notNull(),
  name:       text("name").notNull(),
  role:       text("role").notNull(), // หัวหน้าคนงาน | คนงานทั่วไป | คนขับรถ | ช่าง
  phone:      text("phone"),
  status:     text("status").notNull().default("active"), // active | inactive
  hireDate:   date("hire_date", { mode: "string" }).notNull(),
  dailyWage:  real("daily_wage").notNull().default(0),
  notes:      text("notes"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkerSchema = createInsertSchema(workersTable, {
  hireDate: z.string(),
}).omit({ id: true, createdAt: true });
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workersTable.$inferSelect;

export const attendanceTable = pgTable("attendance", {
  id:          serial("id").primaryKey(),
  userId:      integer("user_id").notNull(),
  workerId:    integer("worker_id").notNull(),
  date:        date("date", { mode: "string" }).notNull(),
  status:      text("status").notNull().default("present"), // present | absent | leave | half_day
  hoursWorked: real("hours_worked"),
  notes:       text("notes"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendanceTable, {
  date: z.string(),
}).omit({ id: true, createdAt: true });
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendanceTable.$inferSelect;
