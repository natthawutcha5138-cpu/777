// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, orgSettingsTable } from "@workspace/db";
import { UpdateOrgSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateSettings(userId: number) {
  const [existing] = await db.select().from(orgSettingsTable).where(eq(orgSettingsTable.userId, userId));
  if (existing) return existing;
  const [created] = await db.insert(orgSettingsTable).values({ userId }).returning();
  return created;
}

router.get("/settings/org", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const settings = await getOrCreateSettings(userId);
  res.json(settings);
});

router.patch("/settings/org", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = UpdateOrgSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await getOrCreateSettings(userId);
  const [updated] = await db
    .update(orgSettingsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(orgSettingsTable.userId, userId))
    .returning();
  res.json(updated);
});

export default router;
