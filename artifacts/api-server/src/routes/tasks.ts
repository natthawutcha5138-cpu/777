// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tasksTable } from "@workspace/db";
import {
  CreateTaskBody,
  UpdateTaskParams,
  UpdateTaskBody,
  DeleteTaskParams,
  ListTasksQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tasks", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = ListTasksQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conditions = [eq(tasksTable.userId, userId)];
  if (params.data.status) conditions.push(eq(tasksTable.status, params.data.status));
  const tasks = await db.select().from(tasksTable).where(and(...conditions)).orderBy(tasksTable.dueDate);
  res.json(tasks);
});

router.post("/tasks", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db.insert(tasksTable).values({ ...parsed.data, userId }).returning();
  res.status(201).json(task);
});

router.get("/tasks/summary", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const tasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));
  const today = new Date().toISOString().slice(0, 10);
  const result = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => t.status !== "done" && t.dueDate && t.dueDate < today).length,
  };
  res.json(result);
});

router.patch("/tasks/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.status === "done") updates.completedAt = new Date();
  if (parsed.data.status && parsed.data.status !== "done") updates.completedAt = null;
  const [task] = await db
    .update(tasksTable)
    .set(updates)
    .where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId)))
    .returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(task);
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(tasksTable)
    .where(and(eq(tasksTable.id, params.data.id), eq(tasksTable.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
