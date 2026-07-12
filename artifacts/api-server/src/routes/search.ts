// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq, and, ilike } from "drizzle-orm";
import {
  db,
  plotsTable,
  transactionsTable,
  tasksTable,
  workersTable,
  inventoryItemsTable,
  equipmentTable,
} from "@workspace/db";
import { GlobalSearchQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = GlobalSearchQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const q = params.data.q.trim();
  if (q.length < 1) {
    res.json({ results: [] });
    return;
  }
  const like = `%${q}%`;

  const [plots, transactions, tasks, workers, inventory, equipment] = await Promise.all([
    db.select().from(plotsTable).where(and(eq(plotsTable.userId, userId), ilike(plotsTable.name, like))),
    db.select().from(transactionsTable).where(and(eq(transactionsTable.userId, userId), ilike(transactionsTable.category, like))),
    db.select().from(tasksTable).where(and(eq(tasksTable.userId, userId), ilike(tasksTable.title, like))),
    db.select().from(workersTable).where(and(eq(workersTable.userId, userId), ilike(workersTable.name, like))),
    db.select().from(inventoryItemsTable).where(and(eq(inventoryItemsTable.userId, userId), ilike(inventoryItemsTable.name, like))),
    db.select().from(equipmentTable).where(and(eq(equipmentTable.userId, userId), ilike(equipmentTable.name, like))),
  ]);

  const results = [
    ...plots.map((p) => ({ id: p.id, type: "plot" as const, title: p.name, subtitle: `${p.variety} · ${p.areRai} ไร่`, path: "/plots" })),
    ...transactions.map((t) => ({ id: t.id, type: "transaction" as const, title: t.category, subtitle: `${t.type === "income" ? "รายรับ" : "รายจ่าย"} · ${t.date}`, path: "/accounting" })),
    ...tasks.map((t) => ({ id: t.id, type: "task" as const, title: t.title, subtitle: t.status, path: "/tasks" })),
    ...workers.map((w) => ({ id: w.id, type: "worker" as const, title: w.name, subtitle: w.role, path: "/workers" })),
    ...inventory.map((i) => ({ id: i.id, type: "inventory" as const, title: i.name, subtitle: `${i.quantity} ${i.unit}`, path: "/inventory" })),
    ...equipment.map((e) => ({ id: e.id, type: "equipment" as const, title: e.name, subtitle: e.status, path: "/equipment" })),
  ];

  res.json({ results });
});

export default router;
