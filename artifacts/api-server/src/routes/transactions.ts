// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, transactionsTable } from "@workspace/db";
import {
  CreateTransactionBody,
  UpdateTransactionParams,
  UpdateTransactionBody,
  UpdateTransactionResponse,
  DeleteTransactionParams,
  ListTransactionsResponse,
  ListTransactionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/transactions", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = ListTransactionsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { type, year, month } = params.data;

  const conditions: ReturnType<typeof eq>[] = [eq(transactionsTable.userId, userId)];
  if (type) conditions.push(eq(transactionsTable.type, type));
  if (year) conditions.push(sql`EXTRACT(YEAR FROM ${transactionsTable.date}::date) = ${year}`);
  if (month) conditions.push(sql`EXTRACT(MONTH FROM ${transactionsTable.date}::date) = ${month}`);

  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(and(...conditions))
    .orderBy(transactionsTable.date);

  res.json(ListTransactionsResponse.parse(transactions));
});

router.post("/transactions", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [tx] = await db.insert(transactionsTable).values({ ...parsed.data, userId }).returning();
  res.status(201).json(tx);
});

router.patch("/transactions/:id", async (req, res): Promise<void> => {
  const params = UpdateTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.session.userId!;
  const [tx] = await db
    .update(transactionsTable)
    .set(parsed.data)
    .where(and(eq(transactionsTable.id, params.data.id), eq(transactionsTable.userId, userId)))
    .returning();
  if (!tx) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.json(UpdateTransactionResponse.parse(tx));
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(transactionsTable)
    .where(and(eq(transactionsTable.id, params.data.id), eq(transactionsTable.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
