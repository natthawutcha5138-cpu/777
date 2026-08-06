/**
 * farmHistoryService.ts
 *
 * Frontend service for /farm-history page.
 * Calls the API server (which uses the existing Supabase/Drizzle db client).
 * Uses session cookies automatically — no separate Supabase client needed.
 */

import { useQuery } from "@tanstack/react-query";

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

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * useYearlySummaries
 * Fetches income/expense/profit/ROI summaries for multiple years from Supabase
 * via the API server.  Returns all requested years for the history table.
 */
export function useYearlySummaries(years: number[]) {
  const key = years.slice().sort().join(",");
  return useQuery<YearlySummary[]>({
    queryKey: ["farm-history", "yearly-summaries", key],
    queryFn: () =>
      apiFetch<YearlySummary[]>(`/api/farm-history/yearly-summaries?years=${key}`),
    enabled: years.length > 0,
    staleTime: 60_000,
  });
}

/**
 * useRadarMetrics
 * Fetches 6 real radar metrics for a given year:
 *   ผลผลิต, คุณภาพผลผลิต, ต้นทุนการผลิต,
 *   ประสิทธิภาพงาน, ประสิทธิภาพแรงงาน, สุขภาพคลังสินค้า
 * Data sources: transactions, tasks, attendance, inventory_items (all Supabase).
 */
export function useRadarMetrics(year: number) {
  return useQuery<RadarMetricsResult>({
    queryKey: ["farm-history", "radar", year],
    queryFn: () =>
      apiFetch<RadarMetricsResult>(`/api/farm-history/radar?year=${year}`),
    staleTime: 60_000,
  });
}
