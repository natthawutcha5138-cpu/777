// @ts-nocheck
import { db } from "@workspace/db";
import {
  transactionsTable,
  plotsTable,
  tasksTable,
  attendanceTable,
  inventoryItemsTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YearlySummary {
  year: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  roi: number;
  totalPlots: number;
  totalTrees: number;
  totalAreaRai: number;
  costPerRai: number;
  revenuePerTree: number;
}

export interface RadarMetric {
  metric: string;
  value: number; // 0–100
}

export interface RadarMetricsResult {
  year: number;
  metrics: RadarMetric[];
}

// ─── getYearlySummaries ───────────────────────────────────────────────────────
// Returns one summary row per requested year, pulling real data from
// transactionsTable (income / expense) and plotsTable (area / tree count).

export async function getYearlySummaries(
  userId: number,
  years: number[],
): Promise<YearlySummary[]> {
  // Plots are user-level (not per-year); fetch once.
  const plots = await db
    .select()
    .from(plotsTable)
    .where(eq(plotsTable.userId, userId));

  const totalPlots   = plots.length;
  const totalTrees   = plots.reduce((s, p) => s + p.treeCount, 0);
  const totalAreaRai = plots.reduce((s, p) => s + p.areRai,    0);

  const results: YearlySummary[] = [];

  for (const year of years) {
    const txs = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          sql`EXTRACT(YEAR FROM ${transactionsTable.date}::date) = ${year}`,
        ),
      );

    const totalIncome  = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const netProfit    = totalIncome - totalExpense;
    const roi          = totalExpense > 0 ? Math.round((netProfit / totalExpense) * 1000) / 10 : 0;
    const costPerRai   = totalAreaRai > 0 ? Math.round(totalExpense / totalAreaRai) : 0;
    const revenuePerTree = totalTrees > 0 ? Math.round(totalIncome / totalTrees) : 0;

    results.push({
      year,
      totalIncome:   Math.round(totalIncome),
      totalExpense:  Math.round(totalExpense),
      netProfit:     Math.round(netProfit),
      roi,
      totalPlots,
      totalTrees,
      totalAreaRai:  Math.round(totalAreaRai * 10) / 10,
      costPerRai,
      revenuePerTree,
    });
  }

  return results;
}

// ─── getRadarMetrics ──────────────────────────────────────────────────────────
// Returns 6 real metrics (0–100 each) for the Radar chart, derived from:
//   1. ผลผลิต            — income score vs ROI
//   2. คุณภาพผลผลิต      — ROI normalised
//   3. ต้นทุนการผลิต      — cost efficiency (lower expense ratio = higher score)
//   4. ประสิทธิภาพงาน     — task completion rate (tasksTable)
//   5. ประสิทธิภาพแรงงาน  — attendance rate (attendanceTable)
//   6. สุขภาพคลังสินค้า   — inventory above min level (inventoryItemsTable)

export async function getRadarMetrics(
  userId: number,
  year: number,
): Promise<RadarMetricsResult> {
  // -- 1 & 2 & 3: financial metrics --
  const txs = await db
    .select()
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        sql`EXTRACT(YEAR FROM ${transactionsTable.date}::date) = ${year}`,
      ),
    );

  const income  = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const roi     = expense > 0 ? (income - expense) / expense * 100 : 0;

  // Income score: normalise ROI into 0–100 (ROI 50% → 100, 0% → 50, negative → lower)
  const incomeScore     = Math.round(Math.min(100, Math.max(0, roi > 0 ? Math.min(100, roi * 1.5 + 50) : Math.max(0, 50 + roi))));
  // Quality score: ROI * 2, capped at 100
  const qualityScore    = Math.round(Math.min(100, Math.max(0, roi * 2)));
  // Cost efficiency: lower expense/income ratio → higher score (60% ratio → ~80 pts)
  const costRatio       = income > 0 ? (expense / income) : 1;
  const costScore       = Math.round(Math.min(100, Math.max(0, Math.round((1 - costRatio) * 100 + 20))));

  // -- 4: task completion rate --
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.userId, userId),
        sql`EXTRACT(YEAR FROM ${tasksTable.createdAt}) = ${year}`,
      ),
    );

  const doneTasks   = tasks.filter(t => t.status === "done").length;
  const taskScore   = tasks.length > 0
    ? Math.round((doneTasks / tasks.length) * 100)
    : 50; // neutral when no data

  // -- 5: worker attendance rate --
  const attendance = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.userId, userId),
        sql`EXTRACT(YEAR FROM ${attendanceTable.date}::date) = ${year}`,
      ),
    );

  const presentCount    = attendance.filter(a => a.status === "present" || a.status === "half_day").length;
  const attendanceScore = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100)
    : 50;

  // -- 6: inventory health --
  const inventory = await db
    .select()
    .from(inventoryItemsTable)
    .where(eq(inventoryItemsTable.userId, userId));

  const healthyItems    = inventory.filter(i => i.quantity >= i.minQuantity).length;
  const inventoryScore  = inventory.length > 0
    ? Math.round((healthyItems / inventory.length) * 100)
    : 50;

  return {
    year,
    metrics: [
      { metric: "ผลผลิต",             value: incomeScore },
      { metric: "คุณภาพผลผลิต",       value: qualityScore },
      { metric: "ต้นทุนการผลิต",       value: costScore },
      { metric: "ประสิทธิภาพงาน",      value: taskScore },
      { metric: "ประสิทธิภาพแรงงาน",   value: attendanceScore },
      { metric: "สุขภาพคลังสินค้า",    value: inventoryScore },
    ],
  };
}
