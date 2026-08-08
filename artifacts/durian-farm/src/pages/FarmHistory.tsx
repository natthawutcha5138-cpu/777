import { useState, useMemo, useRef, useCallback } from "react";
import {
  useGetDashboardSummary,
  useGetMonthlyTrend,
  useListPlots,
  getGetDashboardSummaryQueryKey,
  getGetMonthlyTrendQueryKey,
  getListPlotsQueryKey,
} from "@workspace/api-client-react";
import {
  useYearlySummaries,
  useRadarMetrics,
} from "@/services/farmHistoryService";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, Download, FileSpreadsheet,
  Printer, Share2, CalendarDays, Leaf, DollarSign, FlaskConical,
  Shield, BarChart2, AlertTriangle, CheckCircle, Info,
  Sprout, Target, Zap, Award, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MONTHS_TH, EXPENSE_CATEGORIES } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface YearSummary {
  year: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  roi: number;
  totalPlots: number;
  totalTrees: number;
  totalAreaRai: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const AVAILABLE_YEARS = [CURRENT_YEAR - 3, CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

const PIE_COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#64748b"];

const EXPENSE_CAT_LABELS: Record<string, string> = {
  "ปุ๋ย": "ปุ๋ย",
  "ยา/สารเคมี": "ยา",
  "แรงงาน": "แรงงาน",
  "น้ำ/ไฟฟ้า": "น้ำ/ไฟ",
  "อุปกรณ์": "เครื่องจักร",
  "อื่นๆ": "อื่นๆ",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString("th-TH"); }
function fmtB(n: number) { return n.toLocaleString("th-TH") + " ฿"; }
function fmtPct(n: number) { return (n >= 0 ? "+" : "") + n.toFixed(1) + "%"; }

function pctChange(curr: number, prev: number) {
  if (!prev) return 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LoadingPulse({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3 animate-pulse", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700/60 rounded-lg" style={{ width: `${70 + (i % 3) * 10}%`, opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon = BarChart2, title, sub }: { icon?: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center">
        <Icon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-600 max-w-xs">{sub}</p>}
    </div>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-[18px] bg-white dark:bg-[#111318] border border-gray-100 dark:border-white/[0.06]",
      "shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.4)]",
      "overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, iconBg, title, subtitle, badge }: {
  icon: React.ElementType; iconBg: string; title: string; subtitle?: string; badge?: string;
}) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className={cn("text-sm font-bold tabular-nums", highlight ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white")}>
        {value}
      </span>
    </div>
  );
}

function TrendBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 0.5) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
      <Minus className="w-2.5 h-2.5" /> ทรงตัว
    </span>
  );
  const up = pct > 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
      up ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40"
         : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40"
    )}>
      {up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {fmtPct(pct)}
    </span>
  );
}

// Custom tooltip for recharts
function ChartTip({ active, payload, label, formatter }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>;
  label?: string; formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#16191f] border border-gray-100 dark:border-white/[0.08] rounded-xl p-3 shadow-xl text-xs min-w-[140px]">
      {label && <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>}
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-gray-500 dark:text-gray-400">{p.name}</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white tabular-nums">
            {formatter ? formatter(p.value) : p.value.toLocaleString("th-TH")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FarmHistory() {
  const [selectedYear, setSelectedYear]   = useState(CURRENT_YEAR);
  const [compareYear,  setCompareYear]    = useState(CURRENT_YEAR - 1);
  const [activeYears,  setActiveYears]    = useState<number[]>([CURRENT_YEAR]);
  const [tableSearch,  setTableSearch]    = useState("");

  // ── API calls ──
  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary(
    { year: selectedYear },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ year: selectedYear }) } }
  );
  const { data: prevSummary } = useGetDashboardSummary(
    { year: compareYear },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ year: compareYear }) } }
  );
  const { data: monthlyTrend = [], isLoading: trendLoading } = useGetMonthlyTrend(
    { year: selectedYear },
    { query: { queryKey: getGetMonthlyTrendQueryKey({ year: selectedYear }) } }
  );
  const { data: prevTrend = [] } = useGetMonthlyTrend(
    { year: compareYear },
    { query: { queryKey: getGetMonthlyTrendQueryKey({ year: compareYear }) } }
  );
  const { data: plots = [], isLoading: plotsLoading } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });

  // ── New: real Supabase data via farmHistoryService ──
  const { data: yearlySummaries = [], isLoading: yearlyLoading } = useYearlySummaries(AVAILABLE_YEARS);
  const { data: radarMetricsData, isLoading: radarLoading } = useRadarMetrics(selectedYear);
  const { data: prevRadarData } = useRadarMetrics(compareYear);

  // ── Derived data ──
  const totalTrees  = useMemo(() => plots.reduce((s, p) => s + p.treeCount, 0), [plots]);
  const totalAreaRai = useMemo(() => plots.reduce((s, p) => s + p.areRai, 0), [plots]);

  // Monthly chart data (12 months padded)
  const chartMonths = useMemo(() => {
    const map = new Map(monthlyTrend.map(m => [m.month, m]));
    return Array.from({ length: 12 }, (_, i) => {
      const d = map.get(i + 1);
      return {
        name: MONTHS_TH[i],
        income:    d?.income    ?? 0,
        expense:   d?.expense   ?? 0,
        netProfit: d?.netProfit ?? 0,
      };
    });
  }, [monthlyTrend]);

  // Cumulative area chart
  const cumulativeData = useMemo(() => {
    let cumIncome = 0, cumProfit = 0;
    return chartMonths.map(m => {
      cumIncome  += m.income;
      cumProfit  += m.netProfit;
      return { name: m.name, รายได้สะสม: cumIncome, กำไรสะสม: cumProfit };
    });
  }, [chartMonths]);

  // Cost breakdown pie from API expenseByCategory
  const pieData = useMemo(() => {
    if (!summary?.expenseByCategory?.length) return [];
    return summary.expenseByCategory.map(c => ({
      name: EXPENSE_CAT_LABELS[c.category] ?? c.category,
      value: c.total,
    })).filter(d => d.value > 0);
  }, [summary]);

  // Radar chart — use REAL data from farmHistoryService (tasks, attendance, inventory + finance)
  const radarData = useMemo(() => {
    const currMetrics = radarMetricsData?.metrics ?? [];
    const prevMetrics = prevRadarData?.metrics    ?? [];

    // Build a lookup by metric name for quick access
    const currMap = Object.fromEntries(currMetrics.map(m => [m.metric, m.value]));
    const prevMap = Object.fromEntries(prevMetrics.map(m => [m.metric, m.value]));

    const METRIC_KEYS = [
      "ผลผลิต",
      "คุณภาพผลผลิต",
      "ต้นทุนการผลิต",
      "ประสิทธิภาพงาน",
      "ประสิทธิภาพแรงงาน",
      "สุขภาพคลังสินค้า",
    ];

    return METRIC_KEYS.map(metric => ({
      metric,
      curr: currMap[metric] ?? 0,
      prev: prevMap[metric] ?? 0,
    }));
  }, [radarMetricsData, prevRadarData]);

  // Heatmap — monthly profit intensity
  const heatData = useMemo(() => {
    if (!monthlyTrend.length) return [];
    const maxAbs = Math.max(...monthlyTrend.map(m => Math.abs(m.netProfit)), 1);
    return Array.from({ length: 12 }, (_, i) => {
      const d = monthlyTrend.find(m => m.month === i + 1);
      return {
        month: MONTHS_TH[i]!,
        income:  d?.income    ?? 0,
        expense: d?.expense   ?? 0,
        profit:  d?.netProfit ?? 0,
        score:   d ? Math.round(((d.netProfit / maxAbs) + 1) * 50) : 50,
      };
    });
  }, [monthlyTrend]);

  // Multi-year bar data
  const multiYearTrend = useMemo(() => {
    const curr = monthlyTrend;
    const prev = prevTrend;
    return Array.from({ length: 12 }, (_, i) => {
      const c = curr.find(m => m.month === i + 1);
      const p = prev.find(m => m.month === i + 1);
      return {
        name: MONTHS_TH[i]!,
        [`${selectedYear}`]: c?.income ?? 0,
        [`${compareYear}`]: p?.income ?? 0,
      };
    });
  }, [monthlyTrend, prevTrend, selectedYear, compareYear]);

  // Cost breakdown bar chart
  const costMonthlyData = useMemo(() => {
    return chartMonths.map(m => ({
      name: m.name,
      ค่าใช้จ่ายรวม: m.expense,
      รายได้: m.income,
    }));
  }, [chartMonths]);

  // KPI deltas
  const incomeChange   = pctChange(summary?.totalIncome  ?? 0, prevSummary?.totalIncome  ?? 0);
  const expenseChange  = pctChange(summary?.totalExpense ?? 0, prevSummary?.totalExpense ?? 0);
  const profitChange   = pctChange(summary?.netProfit    ?? 0, prevSummary?.netProfit    ?? 0);
  const roiChange      = (summary?.roi ?? 0) - (prevSummary?.roi ?? 0);

  // Gauge score (0–100 derived from ROI)
  const farmScore = Math.min(100, Math.max(0, Math.round((summary?.roi ?? 0) * 1.5 + 50)));

  // Table rows: use real multi-year summaries from Supabase (all AVAILABLE_YEARS)
  const tableRows: YearSummary[] = useMemo(() => {
    if (!yearlySummaries.length) return [];
    return yearlySummaries.map(s => ({
      year:         s.year,
      totalIncome:  s.totalIncome,
      totalExpense: s.totalExpense,
      netProfit:    s.netProfit,
      roi:          s.roi,
      totalPlots:   s.totalPlots,
      totalTrees:   s.totalTrees,
      totalAreaRai: s.totalAreaRai,
    })).sort((a, b) => b.year - a.year); // newest first
  }, [yearlySummaries]);

  const filteredRows = tableRows.filter(r =>
    !tableSearch || String(r.year).includes(tableSearch)
  );

  // Toggle multi-year selection
  function toggleYear(y: number) {
    setActiveYears(prev =>
      prev.includes(y) ? (prev.length > 1 ? prev.filter(x => x !== y) : prev) : [...prev, y]
    );
    setSelectedYear(y);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 page-enter">

      {/* ── Page Header ── */}
      <div className="relative h-32 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #22c55e 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 40%)"
        }} />
        <div className="absolute inset-0 flex items-center px-8 gap-5">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">ข้อมูลย้อนหลัง / ประวัติสวน</h1>
            <p className="text-sm text-white/70 mt-1">วิเคราะห์ผลการดำเนินงานและแนวโน้มสวนทุเรียน</p>
          </div>
          {/* Export actions */}
          <div className="hidden md:flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold transition-all">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold transition-all">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold transition-all">
              <Printer className="w-3.5 h-3.5" /> พิมพ์
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold transition-all">
              <Share2 className="w-3.5 h-3.5" /> แชร์
            </button>
          </div>
        </div>
      </div>

      {/* ── Year Selector ── */}
      <SectionCard>
        <div className="px-6 py-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <CalendarDays className="w-4 h-4 text-green-500" />
            เลือกปีที่ต้องการวิเคราะห์
          </div>
          <div className="flex gap-2 flex-wrap">
            {AVAILABLE_YEARS.map(y => (
              <button
                key={y}
                onClick={() => toggleYear(y)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border-2",
                  activeYears.includes(y)
                    ? "bg-green-600 text-white border-green-600 shadow-sm shadow-green-500/20"
                    : "bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600"
                )}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            <Filter className="w-3 h-3" />
            เปรียบเทียบกับ
            <select
              value={compareYear}
              onChange={e => setCompareYear(Number(e.target.value))}
              className="text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 outline-none"
            >
              {AVAILABLE_YEARS.filter(y => y !== selectedYear).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Summary Card (Priority สูงสุด)
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionCard>
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-green-600/10 via-emerald-500/5 to-transparent border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0 shadow-md shadow-green-500/30">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">📌 สรุปผลการดำเนินงานปีที่ผ่านมา</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-600 text-white rounded-full shadow-sm shadow-green-500/30">ข้อมูลสำคัญ</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ปี {selectedYear} · ภาพรวมทุกด้านของสวน</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {sumLoading ? (
            <LoadingPulse rows={6} />
          ) : !summary ? (
            <EmptyState icon={BarChart2} title="ยังไม่มีข้อมูลสรุปสำหรับปีนี้" sub="เพิ่มข้อมูลรายรับ-รายจ่ายก่อน แล้วข้อมูลจะปรากฏที่นี่" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Column 1 – ภาพรวมสวน */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">ภาพรวมสวน</p>
                <StatRow label="พื้นที่ทั้งหมด" value={`${totalAreaRai.toLocaleString("th-TH")} ไร่`} />
                <StatRow label="จำนวนแปลง" value={`${summary.totalPlots} แปลง`} />
                <StatRow label="จำนวนต้น" value={`${fmt(summary.totalTrees)} ต้น`} />
                {plotsLoading && <LoadingPulse rows={2} />}
              </div>
              {/* Column 2 – ผลผลิต */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">ผลการเงิน</p>
                <StatRow label="รายได้รวม" value={fmtB(summary.totalIncome)} highlight />
                <StatRow label="ต้นทุนรวม" value={fmtB(summary.totalExpense)} />
                <StatRow label="กำไรสุทธิ" value={fmtB(summary.netProfit)} highlight />
                <StatRow label="ROI" value={`${summary.roi.toFixed(1)}%`} highlight />
                <StatRow label="ต้นทุน/ไร่" value={fmtB(summary.costPerRai)} />
                <StatRow label="รายได้/ต้น" value={fmtB(summary.revenuePerTree)} />
              </div>
              {/* Column 3 – ต้นทุนแยกประเภท */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">ต้นทุนแยกประเภท</p>
                {summary.expenseByCategory && summary.expenseByCategory.length > 0 ? (
                  summary.expenseByCategory.map(c => (
                    <StatRow key={c.category} label={c.category} value={fmtB(c.total)} />
                  ))
                ) : (
                  <p className="text-xs text-gray-400">ยังไม่มีข้อมูล</p>
                )}
              </div>
              {/* Column 4 – big numbers */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200/60 dark:border-green-900/40 p-5 flex flex-col gap-1">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">กำไรสุทธิ</p>
                  <p className="text-3xl font-black text-green-700 dark:text-green-400 tabular-nums leading-none">
                    {fmtB(summary.netProfit)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TrendBadge pct={profitChange} />
                    <span className="text-[10px] text-gray-500">vs ปี {compareYear}</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 p-5 flex flex-col gap-1">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">ROI ปีนี้</p>
                  <p className="text-3xl font-black text-amber-700 dark:text-amber-400 tabular-nums leading-none">
                    {summary.roi.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{roiChange >= 0 ? `+${roiChange.toFixed(1)}%` : `${roiChange.toFixed(1)}%`} vs ปี {compareYear}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — KPI Cards
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { icon: Leaf,        label: "จำนวนต้น",   value: summary ? fmt(summary.totalTrees)   : "—", sub: `${fmt(totalAreaRai)} ไร่`, pct: 0,            color: "green"  },
          { icon: Sprout,      label: "รายได้รวม",   value: summary ? fmtB(summary.totalIncome)  : "—", sub: `${fmt(summary?.revenuePerTree ?? 0)} ฿/ต้น`, pct: incomeChange,  color: "emerald" },
          { icon: DollarSign,  label: "กำไรสุทธิ",  value: summary ? fmtB(summary.netProfit)    : "—", sub: `ROI ${summary?.roi?.toFixed(1) ?? 0}%`,      pct: profitChange,  color: "teal"   },
          { icon: FlaskConical,label: "ค่าปุ๋ย",     value: summary?.expenseByCategory?.find(c => c.category === "ปุ๋ย") ? fmtB(summary.expenseByCategory.find(c => c.category === "ปุ๋ย")!.total) : "—", sub: "ประมาณการ", pct: 0, color: "blue"   },
          { icon: Shield,      label: "ค่ายา",       value: summary?.expenseByCategory?.find(c => c.category === "ยา/สารเคมี") ? fmtB(summary.expenseByCategory.find(c => c.category === "ยา/สารเคมี")!.total) : "—", sub: "ประมาณการ", pct: 0, color: "violet" },
          { icon: TrendingUp,  label: "ต้นทุนรวม",  value: summary ? fmtB(summary.totalExpense) : "—", sub: `${fmtB(summary?.costPerRai ?? 0)}/ไร่`, pct: expenseChange, color: "amber"  },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[18px] bg-white dark:bg-[#111318] border border-gray-100 dark:border-white/[0.06] p-5 flex flex-col gap-3 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-200 group cursor-default"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                card.color === "green"   && "bg-green-100 dark:bg-green-900/40",
                card.color === "emerald" && "bg-emerald-100 dark:bg-emerald-900/40",
                card.color === "teal"    && "bg-teal-100 dark:bg-teal-900/40",
                card.color === "blue"    && "bg-blue-100 dark:bg-blue-900/40",
                card.color === "violet"  && "bg-violet-100 dark:bg-violet-900/40",
                card.color === "amber"   && "bg-amber-100 dark:bg-amber-900/40",
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  card.color === "green"   && "text-green-600 dark:text-green-400",
                  card.color === "emerald" && "text-emerald-600 dark:text-emerald-400",
                  card.color === "teal"    && "text-teal-600 dark:text-teal-400",
                  card.color === "blue"    && "text-blue-600 dark:text-blue-400",
                  card.color === "violet"  && "text-violet-600 dark:text-violet-400",
                  card.color === "amber"   && "text-amber-600 dark:text-amber-400",
                )} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                {sumLoading ? (
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white tabular-nums leading-tight mt-0.5">{card.value}</p>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] text-gray-400">{card.sub}</span>
                {Math.abs(card.pct) > 0.5 && <TrendBadge pct={card.pct} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Radar + Line Charts (side-by-side)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Radar Chart */}
        <SectionCard>
          <SectionHeader
            icon={Target}
            iconBg="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
            title="ประสิทธิภาพสวน 6 มิติ"
            subtitle={`เปรียบเทียบ ${selectedYear} กับ ${compareYear}`}
          />
          <div className="p-5">
            {radarLoading ? (
              <LoadingPulse rows={5} />
            ) : !radarMetricsData ? (
              <EmptyState icon={Target} title="ยังไม่มีข้อมูลปีนี้" sub="เพิ่มข้อมูลรายรับ-รายจ่าย งาน และแรงงานก่อน" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#e5e7eb" strokeOpacity={0.3} />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#9ca3af" }} />
                  <Radar name={`ปี ${selectedYear}`} dataKey="curr" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name={`ปี ${compareYear}`}  dataKey="prev" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 2" />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Tooltip content={<ChartTip />} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        {/* Line Chart — monthly trend */}
        <SectionCard>
          <SectionHeader
            icon={TrendingUp}
            iconBg="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
            title="รายได้–กำไรรายเดือน"
            subtitle={`ปี ${selectedYear} รายเดือน (12 เดือน)`}
          />
          <div className="p-5">
            {trendLoading ? (
              <LoadingPulse rows={5} />
            ) : !monthlyTrend.length ? (
              <EmptyState icon={TrendingUp} title="ยังไม่มีข้อมูลรายเดือน" sub="เพิ่มรายการรายรับ-รายจ่ายก่อน" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartMonths} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => (v / 1000).toFixed(0) + "K"} />
                  <Tooltip content={<ChartTip formatter={v => fmtB(v)} />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="income"    name="รายได้"  stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="netProfit" name="กำไร"    stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="6 2" />
                  <Line type="monotone" dataKey="expense"   name="ค่าใช้จ่าย" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="3 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4+5 — Bar + Pie Charts
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Bar Chart — income vs expense */}
        <SectionCard className="xl:col-span-2">
          <SectionHeader
            icon={BarChart2}
            iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
            title="รายได้ vs ค่าใช้จ่ายรายเดือน"
            subtitle={`ปี ${selectedYear}`}
          />
          <div className="p-5">
            {trendLoading ? (
              <LoadingPulse rows={4} />
            ) : !monthlyTrend.length ? (
              <EmptyState icon={BarChart2} title="ยังไม่มีข้อมูล" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={costMonthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => (v / 1000).toFixed(0) + "K"} />
                  <Tooltip content={<ChartTip formatter={v => fmtB(v)} />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="รายได้"      name="รายได้"      fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ค่าใช้จ่ายรวม" name="ค่าใช้จ่ายรวม" fill="#ef4444" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        {/* Pie Chart — expense breakdown */}
        <SectionCard>
          <SectionHeader
            icon={DollarSign}
            iconBg="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
            title="สัดส่วนต้นทุน"
            subtitle="แยกตามประเภท"
          />
          <div className="p-5">
            {sumLoading ? (
              <LoadingPulse rows={4} />
            ) : !pieData.length ? (
              <EmptyState icon={DollarSign} title="ยังไม่มีข้อมูลต้นทุน" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmtB(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-gray-600 dark:text-gray-300">{d.name}</span>
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-200 tabular-nums">{fmtB(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 7 — Area Chart (cumulative)
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={TrendingUp}
          iconBg="bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400"
          title="รายได้สะสมทั้งปี"
          subtitle={`สะสมรายเดือน ปี ${selectedYear}`}
        />
        <div className="p-5">
          {trendLoading ? (
            <LoadingPulse rows={4} />
          ) : !monthlyTrend.length ? (
            <EmptyState icon={TrendingUp} title="ยังไม่มีข้อมูลรายเดือน" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => (v / 1000).toFixed(0) + "K"} />
                <Tooltip content={<ChartTip formatter={v => fmtB(v)} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="รายได้สะสม" stroke="#22c55e" strokeWidth={2.5} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="กำไรสะสม"   stroke="#f59e0b" strokeWidth={2.5} fill="url(#profitGrad)"  />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 8 — Heatmap
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={Zap}
          iconBg="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
          title="Heatmap ประจำปี"
          subtitle={`เดือนที่มีผลผลิต / ต้นทุน / กำไร สูง–ต่ำสุด ปี ${selectedYear}`}
        />
        <div className="p-6">
          {!monthlyTrend.length ? (
            <EmptyState icon={Zap} title="ยังไม่มีข้อมูลรายเดือน" />
          ) : (
            <div className="space-y-4">
              {[
                { label: "รายได้รายเดือน",    key: "income"  as const, color: "#22c55e" },
                { label: "ค่าใช้จ่ายรายเดือน", key: "expense" as const, color: "#ef4444" },
                { label: "กำไรรายเดือน",      key: "profit"  as const, color: "#f59e0b" },
              ].map(row => {
                const vals = heatData.map(d => d[row.key]);
                const max  = Math.max(...vals, 1);
                const min  = Math.min(...vals.filter(v => v !== 0), 0);
                return (
                  <div key={row.label}>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">{row.label}</p>
                    <div className="grid grid-cols-12 gap-1.5">
                      {heatData.map((d, i) => {
                        const val = d[row.key];
                        const normalized = max > 0 ? Math.abs(val) / max : 0;
                        const isNeg = val < 0;
                        const alpha = 0.1 + normalized * 0.8;
                        return (
                          <div
                            key={i}
                            title={`${d.month}: ${fmtB(val)}`}
                            className="relative rounded-lg h-12 flex flex-col items-center justify-center cursor-default transition-transform hover:scale-110 hover:z-10 group"
                            style={{ background: `${isNeg ? "#ef4444" : row.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}` }}
                          >
                            <span className="text-[9px] font-bold text-gray-700 dark:text-gray-200">{d.month}</span>
                            <span className="text-[8px] text-gray-600 dark:text-gray-300 tabular-nums">{val > 0 ? "+" : ""}{(val / 1000).toFixed(0)}K</span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                              {fmtB(val)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 9 — AI Insight + Gauge
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={Zap}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
          title="🤖 AI วิเคราะห์สวน"
          subtitle="ประเมินจากข้อมูลปัจจุบัน"
          badge="AI"
        />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Gauge */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeDasharray="314" strokeDashoffset="0" strokeLinecap="round" className="dark:stroke-gray-700/60" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={farmScore >= 70 ? "#22c55e" : farmScore >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="12"
                    strokeDasharray={`${(farmScore / 100) * 314} 314`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{farmScore}</p>
                  <p className="text-xs font-semibold text-gray-500">/100</p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-2">คะแนนสุขภาพสวน</p>
              <p className={cn(
                "text-xs font-semibold mt-1",
                farmScore >= 70 ? "text-green-600 dark:text-green-400" :
                farmScore >= 40 ? "text-amber-600 dark:text-amber-400" :
                "text-red-600 dark:text-red-400"
              )}>
                {farmScore >= 70 ? "ดีเยี่ยม" : farmScore >= 40 ? "ปานกลาง" : "ต้องปรับปรุง"}
              </p>
            </div>

            {/* Strengths / Weaknesses */}
            <div className="space-y-3">
              {!summary ? (
                <EmptyState icon={Info} title="ต้องการข้อมูลเพื่อวิเคราะห์" sub="เพิ่มข้อมูลรายรับ-รายจ่ายก่อน" />
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <p className="text-xs font-bold text-green-700 dark:text-green-400">จุดแข็ง</p>
                    </div>
                    <ul className="space-y-1">
                      {summary.netProfit > 0 && (
                        <li className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"><span className="text-green-500 mt-0.5 shrink-0">•</span>สวนมีกำไรสุทธิเป็นบวก ({fmtB(summary.netProfit)})</li>
                      )}
                      {summary.roi > 20 && (
                        <li className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"><span className="text-green-500 mt-0.5 shrink-0">•</span>ROI สูงกว่า 20% — ผลตอบแทนดี</li>
                      )}
                      {summary.totalTrees > 50 && (
                        <li className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"><span className="text-green-500 mt-0.5 shrink-0">•</span>จำนวนต้นเพียงพอสำหรับปริมาณผลผลิต</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">จุดอ่อน / ความเสี่ยง</p>
                    </div>
                    <ul className="space-y-1">
                      {summary.totalExpense > summary.totalIncome * 0.6 && (
                        <li className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"><span className="text-amber-500 mt-0.5 shrink-0">•</span>ต้นทุนสูงเกิน 60% ของรายได้</li>
                      )}
                      {summary.roi < 10 && (
                        <li className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"><span className="text-amber-500 mt-0.5 shrink-0">•</span>ROI ต่ำกว่า 10% ควรทบทวนต้นทุน</li>
                      )}
                      {summary.netProfit <= 0 && (
                        <li className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"><span className="text-red-500 mt-0.5 shrink-0">•</span>ขาดทุนในปีนี้ ต้องปรับกลยุทธ์</li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-500" /> คำแนะนำ AI
              </p>
              {!summary ? (
                <p className="text-xs text-gray-400">ต้องการข้อมูลเพื่อสร้างคำแนะนำ</p>
              ) : (
                <ul className="space-y-2">
                  {[
                    summary.totalExpense > 0 && "ติดตามค่าใช้จ่ายปุ๋ยและยาอย่างสม่ำเสมอเพื่อลดต้นทุน",
                    summary.totalTrees > 0 && `เพิ่มผลผลิตต่อต้น (ปัจจุบัน ${fmtB(summary.revenuePerTree)}/ต้น) ด้วยการดูแลระยะทำใบ`,
                    summary.roi < 30 && "พิจารณาเพิ่มมูลค่าผลผลิตด้วยการแปรรูปหรือขายตรง",
                    "วางแผนการใส่ปุ๋ยล่วงหน้าทุกระยะเพื่อลดต้นทุนรวม",
                    "บันทึกผลผลิตและต้นทุนทุกเดือนเพื่อเพิ่มความแม่นยำของ AI",
                  ].filter(Boolean).slice(0, 4).map((tip, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg p-2">
                      <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 10 — Multi-year comparison Bar
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={BarChart2}
          iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
          title="เปรียบเทียบรายได้หลายปี"
          subtitle={`ปี ${selectedYear} vs ปี ${compareYear}`}
        />
        <div className="p-5">
          {trendLoading ? (
            <LoadingPulse rows={4} />
          ) : !monthlyTrend.length && !prevTrend.length ? (
            <EmptyState icon={BarChart2} title="ยังไม่มีข้อมูลเปรียบเทียบ" sub="ต้องมีข้อมูลอย่างน้อย 2 ปีเพื่อเปรียบเทียบ" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={multiYearTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => (v / 1000).toFixed(0) + "K"} />
                <Tooltip content={<ChartTip formatter={v => fmtB(v)} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey={String(selectedYear)} fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey={String(compareYear)}  fill="#f59e0b" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 11 — History Table
      ══════════════════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={CalendarDays}
          iconBg="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          title="ตารางประวัติย้อนหลัง"
          subtitle="รายปี · กรอง / เรียง / Export"
        />
        {/* Table toolbar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-white/[0.06] flex flex-wrap items-center gap-3">
          <input
            value={tableSearch}
            onChange={e => setTableSearch(e.target.value)}
            placeholder="ค้นหาปี..."
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-green-500/30 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 w-32"
          />
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 transition-colors font-semibold">
              <FileSpreadsheet className="w-3 h-3" /> Excel
            </button>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition-colors font-semibold">
              <Download className="w-3 h-3" /> PDF
            </button>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition-colors font-semibold">
              <Printer className="w-3 h-3" /> พิมพ์
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                {["ปี", "พื้นที่ (ไร่)", "จำนวนต้น", "รายได้ (฿)", "ต้นทุน (฿)", "กำไร (฿)", "ROI (%)", "สถานะ"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {yearlyLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8">
                    <LoadingPulse rows={4} />
                  </td>
                </tr>
              ) : !filteredRows.length ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{row.year}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums">{row.totalAreaRai.toFixed(1)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 tabular-nums">{fmt(row.totalTrees)}</td>
                    <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400 tabular-nums">{fmtB(row.totalIncome)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 tabular-nums">{fmtB(row.totalExpense)}</td>
                    <td className={cn("px-4 py-3 font-bold tabular-nums", row.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>{fmtB(row.netProfit)}</td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        row.roi >= 20 ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" :
                        row.roi >= 5  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                        "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      )}>
                        {row.roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        row.netProfit >= 0
                          ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      )}>
                        {row.netProfit >= 0 ? "กำไร" : "ขาดทุน"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-[10px] text-gray-400">
          <span>{filteredRows.length} รายการ</span>
          <span>ข้อมูลจาก Supabase · ปี {AVAILABLE_YEARS[0]}–{AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]}</span>
        </div>
      </SectionCard>

    </div>
  );
}
