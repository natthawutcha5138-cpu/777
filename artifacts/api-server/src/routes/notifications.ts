// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import {
  db,
  notificationsTable,
  tasksTable,
  inventoryItemsTable,
  equipmentTable,
} from "@workspace/db";
import { MarkNotificationReadParams } from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * Scans live farm data for conditions that should surface a notification
 * (overdue tasks, low stock, upcoming equipment maintenance) and inserts
 * any that aren't already present as an unread notification from today.
 */
async function refreshNotifications(userId: number) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId));
  const existingTitles = new Set(
    existing
      .filter((n) => n.createdAt.toISOString().slice(0, 10) === today)
      .map((n) => n.title)
  );

  const toInsert: (typeof notificationsTable.$inferInsert)[] = [];

  const overdueTasks = await db.select().from(tasksTable).where(
    and(eq(tasksTable.userId, userId), sql`${tasksTable.status} != 'done'`)
  );
  for (const t of overdueTasks) {
    if (t.dueDate && t.dueDate < today) {
      const title = `งานเลยกำหนด: ${t.title}`;
      if (!existingTitles.has(title)) {
        toInsert.push({
          userId, type: "task_overdue", title,
          body: `งาน "${t.title}" เลยกำหนดวันที่ ${t.dueDate}`,
          severity: "urgent", relatedPath: "/tasks",
        });
      }
    }
  }

  const items = await db.select().from(inventoryItemsTable).where(eq(inventoryItemsTable.userId, userId));
  for (const i of items) {
    if (i.quantity <= i.minQuantity) {
      const title = `สต็อกต่ำ: ${i.name}`;
      if (!existingTitles.has(title)) {
        toInsert.push({
          userId, type: "low_stock", title,
          body: `${i.name} เหลือ ${i.quantity} ${i.unit} (ขั้นต่ำ ${i.minQuantity} ${i.unit})`,
          severity: "warning", relatedPath: "/inventory",
        });
      }
    }
  }

  const equipmentList = await db.select().from(equipmentTable).where(eq(equipmentTable.userId, userId));
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  for (const e of equipmentList) {
    if (e.nextMaintenanceDate && e.nextMaintenanceDate <= sevenDaysFromNow && e.status !== "retired") {
      const title = `ถึงกำหนดบำรุงรักษา: ${e.name}`;
      if (!existingTitles.has(title)) {
        toInsert.push({
          userId, type: "maintenance_due", title,
          body: `${e.name} ถึงกำหนดบำรุงรักษาวันที่ ${e.nextMaintenanceDate}`,
          severity: "warning", relatedPath: "/equipment",
        });
      }
    }
  }

  if (toInsert.length > 0) {
    await db.insert(notificationsTable).values(toInsert);
  }
}

router.get("/notifications", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  await refreshNotifications(userId);
  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(sql`${notificationsTable.createdAt} DESC`)
    .limit(50);
  res.json(notifications);
});

router.get("/notifications/unread-count", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  await refreshNotifications(userId);
  const notifications = await db.select().from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));
  res.json({ count: notifications.length });
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [notification] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, params.data.id), eq(notificationsTable.userId, userId)))
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
});

router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.userId, userId));
  res.json({ count: 0 });
});

export default router;
