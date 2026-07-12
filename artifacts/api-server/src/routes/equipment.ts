// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, equipmentTable } from "@workspace/db";
import {
  CreateEquipmentBody,
  UpdateEquipmentParams,
  UpdateEquipmentBody,
  DeleteEquipmentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/equipment", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const items = await db.select().from(equipmentTable).where(eq(equipmentTable.userId, userId)).orderBy(equipmentTable.name);
  res.json(items);
});

router.post("/equipment", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(equipmentTable).values({ ...parsed.data, userId }).returning();
  res.status(201).json(item);
});

router.patch("/equipment/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = UpdateEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEquipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db
    .update(equipmentTable)
    .set(parsed.data)
    .where(and(eq(equipmentTable.id, params.data.id), eq(equipmentTable.userId, userId)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Equipment not found" });
    return;
  }
  res.json(item);
});

router.delete("/equipment/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = DeleteEquipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(equipmentTable)
    .where(and(eq(equipmentTable.id, params.data.id), eq(equipmentTable.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Equipment not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
