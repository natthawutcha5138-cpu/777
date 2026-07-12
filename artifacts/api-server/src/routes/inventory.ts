// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, inventoryItemsTable } from "@workspace/db";
import {
  CreateInventoryItemBody,
  UpdateInventoryItemParams,
  UpdateInventoryItemBody,
  DeleteInventoryItemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/inventory", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const items = await db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.userId, userId)).orderBy(inventoryItemsTable.name);
  res.json(items);
});

router.post("/inventory", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(inventoryItemsTable).values({ ...parsed.data, userId }).returning();
  res.status(201).json(item);
});

router.get("/inventory/summary", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const items = await db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.userId, userId));
  const lowStockItems = items.filter((i) => i.quantity <= i.minQuantity);
  const result = {
    totalItems: items.length,
    totalValue: Math.round(items.reduce((s, i) => s + i.quantity * i.costPerUnit, 0)),
    lowStockCount: lowStockItems.length,
    lowStockItems,
  };
  res.json(result);
});

router.patch("/inventory/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = UpdateInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(inventoryItemsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(inventoryItemsTable.id, params.data.id), eq(inventoryItemsTable.userId, userId)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.json(item);
});

router.delete("/inventory/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = DeleteInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(inventoryItemsTable)
    .where(and(eq(inventoryItemsTable.id, params.data.id), eq(inventoryItemsTable.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
