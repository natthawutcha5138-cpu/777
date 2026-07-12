// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, workersTable, attendanceTable } from "@workspace/db";
import {
  CreateWorkerBody,
  UpdateWorkerParams,
  UpdateWorkerBody,
  DeleteWorkerParams,
  CreateAttendanceBody,
  DeleteAttendanceParams,
  ListAttendanceQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/workers", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const workers = await db.select().from(workersTable).where(eq(workersTable.userId, userId)).orderBy(workersTable.name);
  res.json(workers);
});

router.post("/workers", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateWorkerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [worker] = await db.insert(workersTable).values({ ...parsed.data, userId }).returning();
  res.status(201).json(worker);
});

router.patch("/workers/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = UpdateWorkerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateWorkerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [worker] = await db
    .update(workersTable)
    .set(parsed.data)
    .where(and(eq(workersTable.id, params.data.id), eq(workersTable.userId, userId)))
    .returning();
  if (!worker) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }
  res.json(worker);
});

router.delete("/workers/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = DeleteWorkerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(workersTable)
    .where(and(eq(workersTable.id, params.data.id), eq(workersTable.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/attendance", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = ListAttendanceQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conditions = [eq(attendanceTable.userId, userId)];
  if (params.data.workerId) conditions.push(eq(attendanceTable.workerId, params.data.workerId));
  let records = await db.select().from(attendanceTable).where(and(...conditions)).orderBy(attendanceTable.date);
  if (params.data.month) {
    records = records.filter((r) => r.date.startsWith(params.data.month!));
  }
  res.json(records);
});

router.post("/attendance", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [record] = await db.insert(attendanceTable).values({ ...parsed.data, userId }).returning();
  res.status(201).json(record);
});

router.delete("/attendance/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = DeleteAttendanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(attendanceTable)
    .where(and(eq(attendanceTable.id, params.data.id), eq(attendanceTable.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Attendance record not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
