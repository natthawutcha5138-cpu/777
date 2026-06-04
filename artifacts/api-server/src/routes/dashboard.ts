// @ts-nocheck
import { Router, type IRouter } from "express";
import { sql, and, eq } from "drizzle-orm";
import { db, transactionsTable, plotsTable } from "@workspace/db";
import {
  GetDashboardSummaryQueryParams,
  GetDashboardSummaryResponse,
  GetForecastResponse,
  GetMonthlyTrendResponse,
  GetMonthlyTrendQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const params = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const year = params.data.year ?? new Date().getFullYear();

  const userId = req.session.userId!;
  const txConditions = [
    eq(transactionsTable.userId, userId),
    sql`EXTRACT(YEAR FROM ${transactionsTable.date}::date) = ${year}`,
  ];

  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(and(...txConditions));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const roi = totalExpense > 0 ? Math.round((netProfit / totalExpense) * 1000) / 10 : 0;

  const plots = await db.select().from(plotsTable).where(eq(plotsTable.userId, userId));
  const totalPlots = plots.length;
  const totalTrees = plots.reduce((sum, p) => sum + p.treeCount, 0);
  const totalAreaRai = plots.reduce((sum, p) => sum + p.areRai, 0);

  const costPerRai = totalAreaRai > 0 ? Math.round(totalExpense / totalAreaRai) : 0;
  const revenuePerTree = totalTrees > 0 ? Math.round(totalIncome / totalTrees) : 0;

  const expenseByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === "expense") {
      expenseByCategory[t.category] = (expenseByCategory[t.category] ?? 0) + t.amount;
    } else {
      incomeByCategory[t.category] = (incomeByCategory[t.category] ?? 0) + t.amount;
    }
  }

  const result = {
    totalIncome: Math.round(totalIncome),
    totalExpense: Math.round(totalExpense),
    netProfit: Math.round(netProfit),
    roi,
    totalPlots,
    totalTrees,
    totalAreaRai: Math.round(totalAreaRai * 10) / 10,
    costPerRai,
    revenuePerTree,
    expenseByCategory: Object.entries(expenseByCategory).map(([category, total]) => ({
      category,
      total: Math.round(total),
    })),
    incomeByCategory: Object.entries(incomeByCategory).map(([category, total]) => ({
      category,
      total: Math.round(total),
    })),
  };

  res.json(GetDashboardSummaryResponse.parse(result));
});

router.get("/dashboard/monthly-trend", async (req, res): Promise<void> => {
  const params = GetMonthlyTrendQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const year = params.data.year ?? new Date().getFullYear();

  const userId = req.session.userId!;
  const transactions = await db
    .select()
    .from(transactionsTable)
    .where(and(
      eq(transactionsTable.userId, userId),
      sql`EXTRACT(YEAR FROM ${transactionsTable.date}::date) = ${year}`
    ));

  const monthlyData: Record<number, { income: number; expense: number }> = {};
  for (let m = 1; m <= 12; m++) {
    monthlyData[m] = { income: 0, expense: 0 };
  }

  for (const t of transactions) {
    const month = new Date(t.date).getMonth() + 1;
    if (t.type === "income") {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expense += t.amount;
    }
  }

  const trend = Object.entries(monthlyData).map(([month, data]) => ({
    month: parseInt(month),
    year,
    income: Math.round(data.income),
    expense: Math.round(data.expense),
    netProfit: Math.round(data.income - data.expense),
  }));

  res.json(GetMonthlyTrendResponse.parse(trend));
});

router.get("/dashboard/forecast", async (req, res): Promise<void> => {
  const currentYear = new Date().getFullYear();

  const userId = req.session.userId!;
  const getYearTotals = async (year: number) => {
    const txs = await db
      .select()
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, userId),
        sql`EXTRACT(YEAR FROM ${transactionsTable.date}::date) = ${year}`
      ));
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  };

  const [y0, y1, y2] = await Promise.all([
    getYearTotals(currentYear),
    getYearTotals(currentYear - 1),
    getYearTotals(currentYear - 2),
  ]);

  const avgIncome = (y0.income + y1.income + y2.income) / 3;
  const avgExpense = (y0.expense + y1.expense + y2.expense) / 3;

  const inflationRate = 0.065;
  const forecastedExpense = Math.round(avgExpense * (1 + inflationRate));
  const forecastedIncome = Math.round(avgIncome * 1.04);
  const forecastedNetProfit = forecastedIncome - forecastedExpense;

  const prevNetProfit = y1.income - y1.expense;
  const yoyChange =
    prevNetProfit !== 0
      ? Math.round(((forecastedNetProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 1000) / 10
      : 0;

  const now = new Date();
  const month = now.getMonth() + 1;
  let currentSeasonStage = "ก่อนเก็บเกี่ยว–หลังเก็บ (พ.ค.–มิ.ย.)";
  if (month >= 10 || month <= 12) currentSeasonStage = "เตรียมออกดอก (ต.ค.–ธ.ค.)";
  else if (month <= 2) currentSeasonStage = "ออกดอก–ดูแลดอก (ม.ค.–ก.พ.)";
  else if (month <= 4) currentSeasonStage = "ติดผล–พัฒนาผล (มี.ค.–เม.ย.)";

  const recommendations = [
    "เพิ่มสัดส่วนพันธุ์หมอนทองในแปลงใหม่ เนื่องจากความต้องการจากตลาดจีนยังคงสูง และราคาส่งออกคาดว่าจะเพิ่มขึ้น 8–12% ในฤดูกาลหน้า",
    "วางแผนลดต้นทุนปุ๋ยด้วยการซื้อล่วงหน้าก่อนฤดูกาล 2–3 เดือน เนื่องจากราคาปุ๋ยคาดว่าจะปรับตัวสูงขึ้น 5–8% จากต้นทุนพลังงาน",
  ];

  const result = {
    forecastedIncome,
    forecastedExpense,
    forecastedNetProfit,
    yoyChange,
    inputCostInflation: Math.round(inflationRate * 1000) / 10,
    recommendations,
    currentSeasonStage,
  };

  res.json(GetForecastResponse.parse(result));
});

export default router;
