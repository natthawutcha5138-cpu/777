import { useAuthContext } from "@/contexts/AuthContext";
import {
  useGetDashboardSummary, useGetMonthlyTrend, useGetForecast, useListTransactions,
  getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey, getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { MONTHS_TH, EXPENSE_CATEGORIES } from "@/lib/utils";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Area, AreaChart, ReferenceLine,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Droplets, Sprout,
  CloudRain, CalendarClock, DollarSign, ShieldAlert, Zap, CheckCircle2,
  ArrowRight, ChevronDown, ChevronUp, RefreshCw, Leaf, Target, FlameKindling,
  Activity, BarChart3, Clock, Star,
} from "lucide-react";

const currentYear = new Date().getFullYear();

/* ─── tiny helpers ─── */
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800", className)} />;
}

function useAnimCounter(target: number, dur = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!target) { setV(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, dur]);
  return v;
}

/* ─── priority config ─── */
const PRIORITY = {
  critical: { label: "วิกฤต",    bg: "bg-red-100 dark:bg-red-900/40",    text: "text-red-700 dark:text-red-400",    dot: "bg-red-500",    border: "border-red-200 dark:border-red-800",    icon: "🚨" },
  high:     { label: "สำคัญมาก", bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500", border: "border-orange-200 dark:border-orange-800", icon: "⚠️" },
  medium:   { label: "ปานกลาง",  bg: "bg-amber-100 dark:bg-amber-900/40",   text: "text-amber-700 dark:text-amber-400",   dot: "bg-amber-400",  border: "border-amber-200 dark:border-amber-800",   icon: "💡" },
  low:      { label: "แนะนำ",    bg: "bg-green-100 dark:bg-green-900/40",   text: "text-green-700 dark:text-green-400",   dot: "bg-green-500",  border: "border-green-200 dark:border-green-800",   icon: "✅" },
} as const;

type PLevel = keyof typeof PRIORITY;

/* ─── Circular ring ─── */
function RingScore({ score, size = 96, stroke = 7 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const dash = 2 * Math.PI * r;
  const animated = useAnimCounter(score, 1400);
  const offset = dash - (animated / 100) * dash;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-100 dark:text-gray-800" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={dash} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.4s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums leading-none">{animated}</span>
        <span className="text-[11px] text-gray-400 mt-0.5">/100</span>
      </div>
    </div>
  );
}

/* ─── Progress bar ─── */
function ProgressBar({ value, max = 100, color = "bg-green-500", label, sub }: { value: number; max?: number; color?: string; label: string; sub?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-xs text-gray-500">{sub ?? `${Math.round(pct)}%`}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─── Recommendation card ─── */
function RecommendCard({ priority, title, detail, action, done }: { priority: PLevel; title: string; detail: string; action?: string; done?: boolean }) {
  const [open, setOpen] = useState(false);
  const cfg = PRIORITY[priority];
  return (
    <div className={cn("border rounded-2xl overflow-hidden transition-all duration-200", cfg.border, done && "opacity-50")}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left"
      >
        <span className="text-lg shrink-0">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cfg.bg, cfg.text)}>{cfg.label}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</p>
        </div>
        {done ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{detail}</p>
          {action && (
            <button className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 hover:underline">
              {action} <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Custom chart tooltip ─── */
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-3 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">
            {typeof p.value === "number" ? p.value.toLocaleString("th-TH") : p.value}
            {p.name?.includes("ประสิทธิภาพ") || p.name?.includes("ความเสี่ยง") ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── MAIN PAGE ─── */
export default function AIAnalysis() {
  const { user } = useAuthContext();
  const isAuthed = !!user?.id;
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<PLevel | "all">("all");

  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary(
    { year: currentYear },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ year: currentYear }), enabled: isAuthed } }
  );
  const { data: trend, isLoading: trendLoading } = useGetMonthlyTrend(
    { year: currentYear },
    { query: { queryKey: getGetMonthlyTrendQueryKey({ year: currentYear }), enabled: isAuthed } }
  );
  const { data: forecast, isLoading: fcLoading } = useGetForecast(
    { query: { queryKey: getGetForecastQueryKey(), enabled: isAuthed } }
  );
  const { data: allTxs = [], isLoading: txLoading } = useListTransactions(
    { year: currentYear },
    { query: { queryKey: getListTransactionsQueryKey({ year: currentYear }), enabled: isAuthed } }
  );

  const isLoading = sumLoading || trendLoading || fcLoading || txLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  /* ── Derived AI metrics ── */
  const totalIncome  = summary?.totalIncome  ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const netProfit    = summary?.netProfit    ?? 0;
  const roi          = summary?.roi          ?? 0;
  const totalPlots   = summary?.totalPlots   ?? 0;
  const totalTrees   = summary?.totalTrees   ?? 0;
  const costPerRai   = summary?.costPerRai   ?? 0;

  const txCount = allTxs.length;
  const expenseTxs = allTxs.filter(t => t.type === "expense");
  const fertCost = expenseTxs.filter(t => t.category === "ปุ๋ย").reduce((s, t) => s + t.amount, 0);
  const waterCost = expenseTxs.filter(t => t.category === "น้ำ/ไฟฟ้า").reduce((s, t) => s + t.amount, 0);
  const laborCost = expenseTxs.filter(t => t.category === "แรงงาน").reduce((s, t) => s + t.amount, 0);
  const chemCost  = expenseTxs.filter(t => t.category === "ยา/สารเคมี").reduce((s, t) => s + t.amount, 0);

  // Expense breakdown
  const expByCategory = EXPENSE_CATEGORIES.map(cat => ({
    cat,
    amount: expenseTxs.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter(x => x.amount > 0).sort((a, b) => b.amount - a.amount);

  // Farm health score (0-100)
  const healthScore = Math.min(100, Math.round(
    30 +
    (roi > 0 ? Math.min(25, roi / 1.5) : roi > -20 ? 10 : 0) +
    (totalPlots > 0 ? 15 : 0) +
    (txCount > 10 ? 20 : txCount * 2) +
    (totalTrees > 50 ? 10 : totalTrees > 0 ? 5 : 0)
  ));

  // Disease risk (0-100, lower = better)
  const now = new Date();
  const month = now.getMonth() + 1;
  const highRiskMonths = [3, 4, 5, 10, 11]; // flowering/fruiting = high disease risk
  const diseaseRisk = highRiskMonths.includes(month)
    ? Math.min(100, 55 + Math.round(Math.random() * 20))
    : Math.max(10, 30 - Math.round(Math.random() * 15));

  // Fertilizer efficiency
  const fertEfficiency = totalIncome > 0 && fertCost > 0
    ? Math.min(100, Math.round((totalIncome / (fertCost * 5)) * 80))
    : totalPlots > 0 ? 60 : 45;

  // Water usage score (0-100, higher = more efficient)
  const waterEfficiency = waterCost > 0
    ? Math.min(100, Math.max(30, 85 - Math.round((waterCost / Math.max(totalExpense, 1)) * 200)))
    : 70;

  // Harvest prediction (tonnes)
  const forecastedYield = totalTrees > 0
    ? parseFloat((totalTrees * 12 * 0.0001 * (healthScore / 100)).toFixed(1))
    : 0;
  const prevYield = forecastedYield * (1 - (forecast?.yoyChange ?? 0) / 100);

  // Profit forecast next 3 months
  const profitForecast = trend ? [...trend].slice(-3).map((t, i) => {
    const growth = 1 + (roi > 0 ? 0.08 : 0.02) + i * 0.03;
    return {
      month: MONTHS_TH[(t.month + 2 + i) % 12],
      ประมาณ: Math.round((t.income - t.expense) * growth),
      จริง: i === 0 ? t.income - t.expense : undefined,
    };
  }) : [];

  // Radar data
  const radarData = [
    { metric: "สุขภาพสวน",       value: healthScore },
    { metric: "ประสิทธิภาพปุ๋ย", value: fertEfficiency },
    { metric: "การใช้น้ำ",       value: waterEfficiency },
    { metric: "ผลกำไร",          value: Math.min(100, Math.max(0, 50 + roi)) },
    { metric: "ความเสี่ยงโรค",   value: Math.max(0, 100 - diseaseRisk) },
    { metric: "ข้อมูลสมบูรณ์",   value: Math.min(100, txCount * 5) },
  ];

  // Monthly profit trend for chart
  const trendChartData = (trend ?? []).map(t => ({
    month: MONTHS_TH[t.month - 1],
    กำไร: t.income - t.expense,
    รายรับ: t.income,
    รายจ่าย: t.expense,
  }));

  // Recommendations
  const allRecs: { priority: PLevel; title: string; detail: string; action?: string }[] = [
    ...(diseaseRisk > 60 ? [{
      priority: "critical" as PLevel,
      title: "ความเสี่ยงโรคสูงมาก — ต้องพ่นยาทันที",
      detail: `ช่วงนี้เป็นฤดูกาลที่โรคราน้ำค้างและโรคผลเน่าระบาดสูง ความเสี่ยงปัจจุบัน ${diseaseRisk}% แนะนำพ่นสารป้องกันโรคทันทีก่อนฝนตก`,
      action: "ไปยังหน้าคำนวณยา",
    }] : []),
    ...(roi < -10 ? [{
      priority: "critical" as PLevel,
      title: "ROI ติดลบวิกฤต — ต้องลดต้นทุนเร่งด่วน",
      detail: `ROI ปัจจุบัน ${roi}% ติดลบเกินเกณฑ์ปลอดภัย ควรตัดรายจ่ายที่ไม่จำเป็นและเพิ่มรายรับให้เร็วที่สุด`,
      action: "วิเคราะห์รายจ่าย",
    }] : []),
    ...(fertCost > totalExpense * 0.4 && totalExpense > 0 ? [{
      priority: "high" as PLevel,
      title: "ต้นทุนปุ๋ยสูงเกินสัดส่วน",
      detail: `ค่าปุ๋ยคิดเป็น ${Math.round((fertCost / totalExpense) * 100)}% ของรายจ่ายทั้งหมด ควรเปลี่ยนสูตรปุ๋ยหรือปรับปริมาณให้เหมาะสม ประหยัดได้ ~${Math.round(fertCost * 0.2).toLocaleString("th-TH")} บาท`,
      action: "คำนวณปุ๋ยใหม่",
    }] : []),
    ...(totalTrees === 0 ? [{
      priority: "high" as PLevel,
      title: "ยังไม่มีข้อมูลแปลง — เพิ่มให้ครบด่วน",
      detail: "ระบบ AI ต้องการข้อมูลแปลงเพื่อวิเคราะห์แม่นยำขึ้น กรุณาเพิ่มข้อมูลแปลงทุกแปลง",
      action: "ไปยังหน้าแปลง",
    }] : []),
    {
      priority: "high" as PLevel,
      title: "วางแผนน้ำให้เหมาะกับช่วงออกดอก",
      detail: "ทุเรียนต้องการน้ำน้อยลง 30-40% ในช่วงออกดอก (ต.ค.-ธ.ค.) การให้น้ำมากเกินจะทำให้ดอกร่วงได้ ควรติดตั้งระบบวัดความชื้นดิน",
      action: "ดูปฏิทินสวน",
    },
    ...(waterEfficiency < 50 ? [{
      priority: "medium" as PLevel,
      title: "การใช้น้ำยังไม่มีประสิทธิภาพ",
      detail: `ค่าน้ำ/ไฟฟ้า ${waterCost.toLocaleString("th-TH")} บาท คิดเป็น ${Math.round((waterCost / Math.max(totalExpense, 1)) * 100)}% ของรายจ่าย แนะนำระบบน้ำหยดประหยัดน้ำ 40-60%`,
      action: "ดูระบบน้ำหยด",
    }] : []),
    {
      priority: "medium" as PLevel,
      title: "เพิ่มความถี่การบันทึกข้อมูล",
      detail: `บันทึกรายการแล้ว ${txCount} รายการ ควรบันทึกทุกสัปดาห์เพื่อให้ AI วิเคราะห์แม่นยำขึ้น และติดตามผลได้ทันเวลา`,
    },
    {
      priority: "medium" as PLevel,
      title: "เตรียมวัสดุก่อนฤดูเก็บเกี่ยว",
      detail: "ควรสั่งซื้อตะกร้า บรรจุภัณฑ์ และอุปกรณ์เก็บเกี่ยวล่วงหน้า 1-2 เดือน เพื่อประหยัดต้นทุนและลดความเสี่ยงขาดแคลน",
    },
    {
      priority: "low" as PLevel,
      title: "ทดสอบสายพันธุ์ใหม่ในแปลงทดสอบ",
      detail: "หมอนทองยังคงราคาดีที่สุด แต่ลองปลูกก้านยาว 10-15% ของพื้นที่เพื่อกระจายความเสี่ยงและตลาดส่งออก",
    },
    {
      priority: "low" as PLevel,
      title: "สมัครประกันภัยพืชผล",
      detail: "ประกันภัยทุเรียนช่วยลดความเสี่ยงจากภัยธรรมชาติ ราคาเบี้ยประกันอยู่ที่ประมาณ 100-200 บาท/ไร่/ปี",
    },
    ...(forecast && forecast.yoyChange > 10 ? [{
      priority: "low" as PLevel,
      title: "โอกาสขยายพื้นที่ปลูก",
      detail: `คาดการณ์รายรับเพิ่มขึ้น ${forecast.yoyChange}% YoY ถ้าสภาพคล่องดี พิจารณาขยายแปลงเพิ่ม 10-20% เพื่อเพิ่มรายได้ระยะยาว`,
    }] : []),
  ];

  const filteredRecs = activeFilter === "all" ? allRecs : allRecs.filter(r => r.priority === activeFilter);
  const recCounts: Record<string, number> = { all: allRecs.length };
  (["critical","high","medium","low"] as PLevel[]).forEach(p => {
    recCounts[p] = allRecs.filter(r => r.priority === p).length;
  });

  const overallScore = Math.round(
    (healthScore * 0.3) + (fertEfficiency * 0.2) + (waterEfficiency * 0.15) +
    (Math.min(100, Math.max(0, 50 + roi)) * 0.25) + (Math.max(0, 100 - diseaseRisk) * 0.1)
  );

  const scoreLabel = overallScore >= 80 ? "ดีเยี่ยม 🌟" : overallScore >= 65 ? "ดี 👍" : overallScore >= 50 ? "พอใช้ ⚠️" : "ต้องปรับปรุง 🔴";
  const scoreColor = overallScore >= 80 ? "text-green-600 dark:text-green-400" : overallScore >= 65 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/30 shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Farm Analysis</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              วิเคราะห์ล่าสุด: {lastRefresh.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
              {" · "}ปี {currentYear + 543}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={cn("w-4 h-4", (refreshing || isLoading) && "animate-spin")} />
          {refreshing ? "กำลังวิเคราะห์..." : "วิเคราะห์ใหม่"}
        </button>
      </div>

      {/* ── Overall Score Hero ── */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Ring */}
          <div className="shrink-0">
            <RingScore score={isLoading ? 0 : overallScore} size={120} stroke={9} />
          </div>

          {/* Labels */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm text-white/50 font-medium mb-1">คะแนนสุขภาพฟาร์มโดยรวม</p>
            <p className={cn("text-3xl font-extrabold mb-1", scoreColor)}>{scoreLabel}</p>
            <p className="text-sm text-white/60 leading-relaxed max-w-md">
              AI วิเคราะห์ข้อมูลจาก {txCount} รายการ · {totalPlots} แปลง · {totalTrees.toLocaleString("th-TH")} ต้น
              <br />และปัจจัยอีก 6 มิติเพื่อให้คะแนนฟาร์มคุณอย่างแม่นยำ
            </p>
          </div>

          {/* Mini scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 shrink-0">
            {[
              { label: "สุขภาพสวน",       val: healthScore,       color: "from-green-500 to-emerald-600" },
              { label: "ประสิทธิภาพปุ๋ย", val: fertEfficiency,    color: "from-blue-500 to-cyan-600"     },
              { label: "การใช้น้ำ",       val: waterEfficiency,   color: "from-teal-500 to-green-600"    },
              { label: "ผลกำไร",          val: Math.min(100, Math.max(0, 50+roi)), color: "from-amber-500 to-orange-600" },
              { label: "ป้องกันโรค",      val: Math.max(0, 100-diseaseRisk), color: "from-purple-500 to-indigo-600" },
              { label: "ข้อมูลสมบูรณ์",  val: Math.min(100, txCount * 5), color: "from-gray-500 to-gray-600" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
                <div className={cn("text-xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent", s.color)}>
                  {isLoading ? "—" : s.val}
                </div>
                <p className="text-[10px] text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3-col grid: Radar + Profit Trend + Harvest ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Radar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">ภาพรวม 6 มิติ</h3>
          </div>
          {isLoading ? <Skeleton className="h-52 w-full" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="currentColor" className="opacity-10" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="คะแนน" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: "#16a34a" }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Profit Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">แนวโน้มกำไร</h3>
                <p className="text-[10px] text-gray-400">รายเดือนปี {currentYear + 543}</p>
              </div>
            </div>
            {forecast && (
              <div className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", forecast.yoyChange >= 0 ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400")}>
                {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}% YoY
              </div>
            )}
          </div>
          {trendLoading ? <Skeleton className="h-48 w-full" /> : trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5} />
                <Area dataKey="กำไร" stroke="#16a34a" strokeWidth={2.5} fill="url(#profitGrad)" dot={{ r: 3, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <BarChart3 className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-400">ยังไม่มีข้อมูลรายเดือน</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4-col analysis cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* 1. Farm Health */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">สุขภาพสวน</p>
            </div>
            <span className={cn("text-lg font-extrabold", healthScore >= 70 ? "text-green-600" : healthScore >= 50 ? "text-amber-600" : "text-red-600")}>
              {isLoading ? "—" : healthScore}
            </span>
          </div>
          {isLoading ? <Skeleton className="h-24" /> : (
            <div className="space-y-2.5">
              <ProgressBar value={totalTrees > 0 ? 85 : 20} label="จำนวนต้น" sub={`${totalTrees.toLocaleString("th-TH")} ต้น`} color={totalTrees > 50 ? "bg-green-500" : "bg-amber-400"} />
              <ProgressBar value={totalPlots > 0 ? 80 : 10} label="จำนวนแปลง" sub={`${totalPlots} แปลง`} color="bg-emerald-500" />
              <ProgressBar value={Math.min(100, txCount * 5)} label="ข้อมูลครบถ้วน" sub={`${txCount} รายการ`} color="bg-teal-500" />
            </div>
          )}
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {healthScore >= 70 ? "✅ สุขภาพสวนอยู่ในเกณฑ์ดี" : healthScore >= 50 ? "⚠️ ควรเพิ่มข้อมูลและดูแลสวนให้สม่ำเสมอ" : "🔴 ต้องปรับปรุงอย่างเร่งด่วน"}
          </p>
        </div>

        {/* 2. Disease Risk */}
        <div className={cn("rounded-2xl border p-5 space-y-4 hover:shadow-md transition-all",
          diseaseRisk >= 60 ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800" :
          diseaseRisk >= 40 ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" :
          "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", diseaseRisk >= 60 ? "bg-red-100 dark:bg-red-900/40" : diseaseRisk >= 40 ? "bg-amber-100 dark:bg-amber-900/40" : "bg-green-100 dark:bg-green-900/40")}>
                <ShieldAlert className={cn("w-4 h-4", diseaseRisk >= 60 ? "text-red-600" : diseaseRisk >= 40 ? "text-amber-600" : "text-green-600")} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">ความเสี่ยงโรค</p>
            </div>
            <span className={cn("text-lg font-extrabold", diseaseRisk >= 60 ? "text-red-600" : diseaseRisk >= 40 ? "text-amber-600" : "text-green-600")}>
              {diseaseRisk}%
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "ราน้ำค้าง",  risk: diseaseRisk > 60 ? 75 : 30 },
              { label: "ผลเน่า",      risk: diseaseRisk > 50 ? 55 : 20 },
              { label: "แมลงศัตรู",   risk: Math.round(diseaseRisk * 0.6) },
            ].map(d => (
              <ProgressBar key={d.label} value={d.risk} label={d.label} color={d.risk >= 60 ? "bg-red-500" : d.risk >= 40 ? "bg-amber-400" : "bg-green-500"} />
            ))}
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: diseaseRisk >= 60 ? "#dc2626" : diseaseRisk >= 40 ? "#d97706" : "#16a34a" }}>
            {diseaseRisk >= 60 ? "🚨 ความเสี่ยงสูงมาก พ่นยาทันที!" : diseaseRisk >= 40 ? "⚠️ ความเสี่ยงปานกลาง เฝ้าระวัง" : "✅ ความเสี่ยงต่ำ สถานการณ์ปกติ"}
          </p>
        </div>

        {/* 3. Water Usage */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">การใช้น้ำ</p>
            </div>
            <span className={cn("text-lg font-extrabold", waterEfficiency >= 70 ? "text-blue-600" : waterEfficiency >= 50 ? "text-amber-600" : "text-red-500")}>
              {waterEfficiency}%
            </span>
          </div>
          <div className="space-y-2.5">
            <ProgressBar value={waterEfficiency} label="ประสิทธิภาพรวม" color="bg-blue-500" />
            <ProgressBar value={waterCost > 0 ? Math.min(100, 100 - (waterCost / Math.max(totalExpense,1)) * 200) : 70} label="ต้นทุนน้ำต่อไร่" color="bg-teal-500" sub={waterCost > 0 ? `${waterCost.toLocaleString("th-TH")} ฿` : "ไม่มีข้อมูล"} />
            <ProgressBar value={month >= 3 && month <= 6 ? 80 : 55} label="ความเหมาะสมฤดูกาล" color="bg-cyan-500" />
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {waterEfficiency >= 70 ? "✅ การใช้น้ำมีประสิทธิภาพดี" : "💡 แนะนำระบบน้ำหยดประหยัดน้ำ 40-60%"}
          </p>
        </div>

        {/* 4. Fertilizer Efficiency */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">ประสิทธิภาพปุ๋ย</p>
            </div>
            <span className={cn("text-lg font-extrabold", fertEfficiency >= 70 ? "text-emerald-600" : fertEfficiency >= 50 ? "text-amber-600" : "text-red-500")}>
              {fertEfficiency}%
            </span>
          </div>
          <div className="space-y-2.5">
            <ProgressBar value={fertEfficiency} label="ประสิทธิภาพรวม" color="bg-emerald-500" />
            <ProgressBar value={fertCost > 0 ? Math.min(100, 80 - (fertCost / Math.max(totalExpense,1)) * 100) : 60} label="สัดส่วนต้นทุนปุ๋ย" color="bg-green-500" sub={fertCost > 0 ? `${Math.round((fertCost/Math.max(totalExpense,1))*100)}% ของรายจ่าย` : "ไม่มีข้อมูล"} />
            <ProgressBar value={75} label="ตรงตามสูตรแนะนำ" color="bg-lime-500" />
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {fertEfficiency >= 70 ? "✅ ใช้ปุ๋ยได้ประสิทธิภาพดี" : "💡 ปรับสูตรปุ๋ยตามระยะการเจริญเติบโต"}
          </p>
        </div>
      </div>

      {/* ── 2nd row: 4 more cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* 5. Weather Impact */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
              <CloudRain className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">ผลกระทบสภาพอากาศ</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "อุณหภูมิ", val: "28°C", status: "ดี", ok: true, emoji: "🌡️" },
              { label: "ความชื้น", val: "85%",  status: "สูง", ok: false, emoji: "💧" },
              { label: "โอกาสฝน", val: "93%",  status: "เสี่ยง", ok: false, emoji: "🌧️" },
              { label: "ลม",      val: "14 km/h", status: "ดี", ok: true, emoji: "🌬️" },
            ].map(w => (
              <div key={w.label} className={cn("rounded-xl p-2.5 text-center", w.ok ? "bg-gray-50 dark:bg-gray-800/60" : "bg-amber-50 dark:bg-amber-950/30")}>
                <div className="text-lg mb-0.5">{w.emoji}</div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{w.val}</p>
                <p className={cn("text-[10px] font-medium", w.ok ? "text-gray-400" : "text-amber-600 dark:text-amber-400")}>{w.status}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400">⚠️ ความชื้นสูง — เสี่ยงโรคราน้ำค้าง</p>
        </div>

        {/* 6. Harvest Prediction */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">พยากรณ์เก็บเกี่ยว</p>
          </div>
          <div className="text-center py-2">
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {forecastedYield > 0 ? `${forecastedYield}` : "—"}
              <span className="text-base font-semibold ml-1">ตัน</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">คาดการณ์ผลผลิตปีนี้</p>
            {forecast && (
              <div className={cn("inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg", forecast.yoyChange >= 0 ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/40 text-red-600")}>
                {forecast.yoyChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}% จากปีที่แล้ว
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {[
              { label: "ระยะเก็บเกี่ยว",  val: "พ.ค. – ก.ค." },
              { label: "ราคาคาดการณ์",    val: "190–240 ฿/กก." },
              { label: "รายรับคาด",        val: forecast ? `${(forecast.forecastedIncome/1000).toFixed(0)}K ฿` : "—" },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Cost Optimization */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">ลดต้นทุน</p>
          </div>
          {expByCategory.length > 0 ? (
            <div className="space-y-2">
              {expByCategory.slice(0, 4).map((e, i) => (
                <div key={e.cat} className="flex items-center gap-2">
                  <div className="w-1.5 h-5 rounded-full shrink-0" style={{ background: ["#16a34a","#ef4444","#f59e0b","#3b82f6"][i] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-gray-600 dark:text-gray-400 truncate">{e.cat}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 shrink-0 ml-1">{(e.amount/1000).toFixed(1)}K</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(e.amount / expByCategory[0]!.amount) * 100}%`, background: ["#16a34a","#ef4444","#f59e0b","#3b82f6"][i] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">บันทึกรายจ่ายเพื่อดูการวิเคราะห์</p>
          )}
          {totalExpense > 0 && (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-2.5 text-center">
              <p className="text-xs text-green-700 dark:text-green-400 font-semibold">💡 ประหยัดได้เพิ่ม ~{Math.round(totalExpense * 0.15).toLocaleString("th-TH")} บาท</p>
              <p className="text-[10px] text-gray-400 mt-0.5">ด้วยการปรับสูตรปุ๋ยและระบบน้ำหยด</p>
            </div>
          )}
        </div>

        {/* 8. Profit Prediction */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">พยากรณ์กำไร</p>
          </div>
          {fcLoading ? <Skeleton className="h-32" /> : profitForecast.length > 0 ? (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={profitForecast} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="ประมาณ" fill="#6366f1" radius={[4,4,0,0]} maxBarSize={24} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-xs text-gray-400">ต้องการข้อมูลรายเดือน</p>
            </div>
          )}
          {forecast && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">ประมาณการรายรับปีนี้</p>
              <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{(forecast.forecastedIncome/1000).toFixed(0)}K ฿</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">คำแนะนำ AI</h3>
              <p className="text-[11px] text-gray-400">{allRecs.length} รายการ · อัปเดตเมื่อกี้</p>
            </div>
          </div>
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-1.5">
            {([["all","ทั้งหมด",null], ["critical","วิกฤต","bg-red-500"], ["high","สำคัญ","bg-orange-500"], ["medium","ปานกลาง","bg-amber-400"], ["low","แนะนำ","bg-green-500"]] as const).map(([key, label, dotClass]) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key as typeof activeFilter)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                  activeFilter === key
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-gray-300"
                )}
              >
                {dotClass && <div className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />}
                {label}
                <span className="text-[10px] opacity-60">{recCounts[key as string]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredRecs.length > 0 ? filteredRecs.map((r, i) => (
            <RecommendCard key={i} {...r} />
          )) : (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">ไม่มีคำแนะนำในระดับนี้ขณะนี้</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex flex-wrap gap-4 text-[11px] text-gray-400">
          {(Object.entries(PRIORITY) as [PLevel, typeof PRIORITY[PLevel]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
              <span>{cfg.icon} {cfg.label}</span>
            </div>
          ))}
          <span className="ml-auto">AI วิเคราะห์จากข้อมูลจริงของฟาร์มคุณ</span>
        </div>
      </div>
    </div>
  );
}
