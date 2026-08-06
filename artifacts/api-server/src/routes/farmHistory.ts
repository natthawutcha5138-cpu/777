// @ts-nocheck
import { Router, type IRouter } from "express";
import { getYearlySummaries, getRadarMetrics } from "../services/farmHistoryService";

const router: IRouter = Router();

// GET /api/farm-history/yearly-summaries?years=2023,2024,2025,2026
// Returns an array of YearlySummary objects for the requested years.
router.get("/farm-history/yearly-summaries", async (req, res): Promise<void> => {
  try {
    const userId      = req.session.userId!;
    const currentYear = new Date().getFullYear();
    const yearsParam  = req.query.years as string | undefined;

    let years: number[];
    if (yearsParam) {
      years = yearsParam
        .split(",")
        .map(Number)
        .filter(y => !isNaN(y) && y > 2000 && y <= currentYear + 1);
    } else {
      // Default: last 4 years
      years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    }

    if (years.length === 0) {
      res.status(400).json({ error: "ระบุปีไม่ถูกต้อง" });
      return;
    }

    const summaries = await getYearlySummaries(userId, years);
    res.json(summaries);
  } catch (err) {
    console.error("[farm-history/yearly-summaries]", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
  }
});

// GET /api/farm-history/radar?year=2026
// Returns 6 radar metrics (0–100 each) derived from real DB data.
router.get("/farm-history/radar", async (req, res): Promise<void> => {
  try {
    const userId = req.session.userId!;
    const year   = req.query.year ? Number(req.query.year) : new Date().getFullYear();

    if (isNaN(year) || year < 2000) {
      res.status(400).json({ error: "ปีไม่ถูกต้อง" });
      return;
    }

    const metrics = await getRadarMetrics(userId, year);
    res.json(metrics);
  } catch (err) {
    console.error("[farm-history/radar]", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
  }
});

export default router;
