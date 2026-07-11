import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  useGetDashboardSummary, useGetMonthlyTrend, useGetForecast, useListTransactions,
  getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey, getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { formatBaht, MONTHS_TH } from "@/lib/utils";
import {
  BarChart, Bar, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceLine,
} from "recharts";
import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Plus, Calculator, Sprout,
  CalendarCheck, ChevronRight, Zap, Target, ArrowUpRight, ArrowDownRight, Activity, Bot, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const BE_YEAR = currentYear + 543;

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

function useAnimatedCounter(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

const spraySchedule = [
  { task: "ใส่ปุ๋ยครั้งที่ 3",  date: "25 พ.ค.", daysLeft: 3,  urgency: "urgent"  },
  { task: "พ่นป้องกันเชื้อรา", date: "28 พ.ค.", daysLeft: 6,  urgency: "warning" },
  { task: "พ่นสารบำรุงใบ",    date: "5 มิ.ย.",  daysLeft: 14, urgency: "normal"  },
];

const calendarTasks: Record<number, { emoji: string; label: string }> = {
  5:  { emoji: "🌿", label: "ใส่ปุ๋ย" },
  12: { emoji: "💧", label: "ให้น้ำ" },
  18: { emoji: "✂️", label: "ตัดแต่ง" },
  25: { emoji: "🌱", label: "ใส่ปุ๋ย" },
  28: { emoji: "🚿", label: "พ่นยา" },
};

const aiRecommendations = [
  {
    level: "urgent", badge: "เร่งด่วน",
    dot: "bg-red-500", dotRing: "ring-red-500/30",
    title: "ต้นทุนปุ๋ยสูงเกินเกณฑ์",
    detail: "ต้นทุนปุ๋ยเพิ่มขึ้น 37% จากเดือนก่อน ควรเปลี่ยนสูตรปุ๋ย",
    path: "/fertilizer",
  },
  {
    level: "warning", badge: "ควรทำ",
    dot: "bg-amber-500", dotRing: "ring-amber-500/30",
    title: "ใกล้ถึงรอบพ่นยา",
    detail: "อีก 3 วัน ถึงรอบพ่นป้องกันโรคเชื้อรา เตรียมยาตามสูตร",
    path: "/fertilizer",
  },
  {
    level: "info", badge: "แนะนำ",
    dot: "bg-green-500", dotRing: "ring-green-500/30",
    title: "กำไรมีแนวโน้มเพิ่มขึ้น",
    detail: "คาดการณ์กำไรปีนี้เพิ่มขึ้น 28% รักษาคุณภาพผลผลิตต่อเนื่อง",
    path: "/forecast",
  },
];

const quickActions = [
  { label: "บันทึกรายการ", icon: Plus,      path: "/accounting",  color: "text-green-600 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50" },
  { label: "คำนวณปุ๋ย",   icon: Calculator, path: "/fertilizer",  color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50"   },
  { label: "ดูแปลง",      icon: Sprout,     path: "/plots",       color: "text-violet-600 dark:text-violet-400",bg: "bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-950/50" },
  { label: "AI วิเคราะห์", icon: Brain,      path: "/ai-analysis", color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50" },
];

function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const monthNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  const adj = firstDay === 0 ? 6 : firstDay - 1;
  const cells: (number | null)[] = Array(adj).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">{monthNames[month]} {year + 543}</p>
        <span className="badge badge-gray">{Object.keys(calendarTasks).length} งาน</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1.5">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-300 dark:text-gray-600 font-medium py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const task = day ? calendarTasks[day] : null;
          return (
            <div
              key={i}
              className={cn(
                "aspect-square flex flex-col items-center justify-center text-[11px] rounded-lg relative cursor-default transition-colors",
                !day && "opacity-0 pointer-events-none",
                day === today && "bg-green-600 text-white font-bold shadow-sm",
                day !== today && day && !task && "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                day !== today && task && "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 font-semibold hover:bg-green-100 dark:hover:bg-green-950/60",
              )}
              title={task ? task.label : undefined}
            >
              {day || ""}
              {task && day !== today && <span className="absolute top-0 right-0 text-[7px] leading-none">{task.emoji}</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {Object.entries(calendarTasks).map(([d, t]) => (
          <span key={d} className="text-[10px] text-gray-400 flex items-center gap-0.5">{t.emoji}<span className="text-gray-300">วันที่ {d}</span></span>
        ))}
      </div>
    </div>
  );
}

function FarmScore({ score }: { score: number }) {
  const animated = useAnimatedCounter(score, 1200);
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
  const r = 28;
  const dash = 2 * Math.PI * r;
  const offset = dash - (animated / 100) * dash;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-18 h-18 shrink-0" style={{ width: 72, height: 72 }}>
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-100 dark:text-gray-800" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={dash} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[18px] font-extrabold text-gray-900 dark:text-white num leading-none">{animated}</span>
          <span className="text-[9px] text-gray-400 leading-none mt-0.5">/100</span>
        </div>
      </div>
      <div>
        <p className="text-[11px] text-gray-400 font-medium mb-1">Farm Health Score</p>
        <p className="text-[14px] font-bold" style={{ color }}>
          {score >= 80 ? "ดีเยี่ยม 🌟" : score >= 60 ? "ดี 👍" : "ต้องปรับปรุง ⚠️"}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">อัปเดตล่าสุดวันนี้</p>
      </div>
    </div>
  );
}

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-3 text-xs" style={{ boxShadow: "var(--shadow-lg)", border: "1px solid hsl(var(--border))" }}>
      <p className="font-semibold text-gray-600 dark:text-gray-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1 last:mb-0">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-gray-400">{p.name}:</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200 num">{Number(p.value).toLocaleString("th-TH")} ฿</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuthContext();
  const isAuthed = !!user?.id;

  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary(
    { year: currentYear },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ year: currentYear }), enabled: isAuthed } }
  );
  const { data: trend, isLoading: trendLoading } = useGetMonthlyTrend(
    { year: currentYear },
    { query: { queryKey: getGetMonthlyTrendQueryKey({ year: currentYear }), enabled: isAuthed } }
  );
  const { data: forecast } = useGetForecast({ query: { queryKey: getGetForecastQueryKey(), enabled: isAuthed } });
  const { data: allTxs = [] } = useListTransactions(
    { year: currentYear },
    { query: { queryKey: getListTransactionsQueryKey({ year: currentYear }), enabled: isAuthed } }
  );

  const netProfit    = summary?.netProfit ?? 0;
  const incomeCount  = useAnimatedCounter(sumLoading ? 0 : (summary?.totalIncome  ?? 0));
  const expenseCount = useAnimatedCounter(sumLoading ? 0 : (summary?.totalExpense ?? 0));
  const profitCount  = useAnimatedCounter(sumLoading ? 0 : Math.abs(netProfit));

  const farmScore = summary
    ? Math.min(100, Math.round(
        40 + (summary.roi > 0 ? Math.min(30, summary.roi / 2) : 0) +
        (summary.totalPlots > 0 ? 15 : 0) + (allTxs.length > 5 ? 15 : allTxs.length * 3)
      ))
    : 72;

  const chartData = trend?.map(t => ({
    month: MONTHS_TH[t.month - 1],
    รายรับ: t.income,
    รายจ่าย: t.expense,
    กำไร: t.income - t.expense,
  })) ?? [];

  const recentTxs = [...allTxs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const now   = new Date();
  const hour  = now.getHours();
  const greeting = hour < 12 ? "อรุณสวัสดิ์" : hour < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  const statCards = [
    {
      label: "รายรับรวม (ปีนี้)", value: incomeCount, prefix: "฿",
      change: "+18.6%", up: true, accentClass: "green",
      sub: `${(summary?.totalIncome ?? 0) > 0 ? ((summary!.totalIncome / 1000).toFixed(0)) + "K" : "—"} บาท`,
      icon: ArrowUpRight, iconBg: "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400",
    },
    {
      label: "รายจ่ายรวม (ปีนี้)", value: expenseCount, prefix: "฿",
      change: "+9.2%", up: false, accentClass: "red",
      sub: `${(summary?.totalExpense ?? 0) > 0 ? ((summary!.totalExpense / 1000).toFixed(0)) + "K" : "—"} บาท`,
      icon: ArrowDownRight, iconBg: "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400",
    },
    {
      label: "กำไรสุทธิ (ปีนี้)", value: profitCount, prefix: netProfit < 0 ? "−฿" : "฿",
      change: `ROI ${summary?.roi ?? 0}%`, up: netProfit >= 0, accentClass: "amber",
      sub: `${Math.abs(netProfit) > 0 ? (Math.abs(netProfit) / 1000).toFixed(0) + "K" : "—"} บาท`,
      icon: TrendingUp, iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    },
    {
      label: "ต้นทุนเฉลี่ย/ไร่", value: summary?.costPerRai ?? 0, prefix: "฿",
      change: "-3.5%", up: true, accentClass: "blue",
      sub: `${summary?.totalPlots ?? 0} แปลง · ${summary?.totalTrees?.toLocaleString("th-TH") ?? 0} ต้น`,
      icon: Activity, iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">

      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">{greeting} 👋</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {now.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {quickActions.map(({ label, icon: Icon, path, color, bg }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn("hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150 border border-transparent", bg, color)}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
          <button
            onClick={() => navigate("/accounting")}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> เพิ่มรายการ
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {sumLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : statCards.map((card, i) => (
          <div key={i} className={cn("stat-card", card.accentClass)}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 leading-tight">{card.label}</p>
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", card.iconBg)}>
                <card.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-[22px] font-extrabold text-gray-900 dark:text-white num tabular-nums leading-none">
              {card.prefix}{card.value.toLocaleString("th-TH")}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 mb-2">{card.sub}</p>
            <div className={cn("flex items-center gap-1 text-[11px] font-semibold", card.up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
              {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {card.change}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Chart */}
        <div className="xl:col-span-2 card-premium p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">รายรับ-รายจ่าย รายเดือน</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">ปี {BE_YEAR}</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              {[{label:"รายรับ",color:"#16a34a"},{label:"รายจ่าย",color:"#ef4444"},{label:"กำไร",color:"#f59e0b"}].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {trendLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="currentColor" className="opacity-[0.04]" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "currentColor", className: "opacity-[0.02]" }} />
                <Bar dataKey="รายรับ"  fill="#16a34a" radius={[4,4,0,0]} maxBarSize={14} opacity={0.85} />
                <Bar dataKey="รายจ่าย" fill="#ef4444" radius={[4,4,0,0]} maxBarSize={14} opacity={0.7} />
                <Line dataKey="กำไร" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2.5, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 rounded-xl bg-gray-50 dark:bg-gray-800/30 flex flex-col items-center justify-center gap-3">
              <p className="text-[13px] text-gray-400">ยังไม่มีข้อมูลรายเดือน</p>
              <button onClick={() => navigate("/accounting")} className="btn-primary text-[12px] py-1.5 px-4">
                <Plus className="w-3.5 h-3.5" /> เริ่มบันทึกรายการ
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Farm Score */}
          <div className="card-premium p-5">
            <div className="section-header">
              <div className="section-header-icon bg-green-50 dark:bg-green-950/40">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">Farm Health Score</h3>
            </div>
            <FarmScore score={farmScore} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "ข้อมูล", val: allTxs.length > 5 ? "ดี" : "น้อย", ok: allTxs.length > 5 },
                { label: "กำไร",  val: netProfit > 0 ? "บวก" : "ลบ",      ok: netProfit > 0 },
                { label: "แปลง",  val: `${summary?.totalPlots ?? 0}`,      ok: (summary?.totalPlots ?? 0) > 0 },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                  <p className={cn("text-[11px] font-bold mt-0.5", item.ok ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recs */}
          <div className="card-premium p-5">
            <div className="section-header">
              <div className="section-header-icon bg-purple-50 dark:bg-purple-950/40">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">AI วิเคราะห์</h3>
            </div>
            <div className="space-y-1.5">
              {aiRecommendations.map(r => (
                <button
                  key={r.title}
                  onClick={() => navigate(r.path)}
                  className="w-full flex items-start gap-2.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors group text-left"
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ring-4", r.dot, r.dotRing)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 leading-snug">{r.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{r.detail}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5 transition-all group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate("/ai-analysis")}
              className="mt-3 w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[12px] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> ดูคำแนะนำทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Schedule */}
        <div className="card-premium p-5">
          <div className="section-header">
            <div className="section-header-icon bg-blue-50 dark:bg-blue-950/40">
              <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">งานที่ใกล้ถึง</h3>
            <button onClick={() => navigate("/fertilizer")} className="ml-auto text-[11px] font-medium text-green-600 dark:text-green-400 hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="space-y-2">
            {spraySchedule.map(item => (
              <div key={item.task} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <div className={cn("w-2 h-2 rounded-full shrink-0",
                  item.urgency === "urgent" ? "bg-red-500" :
                  item.urgency === "warning" ? "bg-amber-500" : "bg-green-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300 truncate">{item.task}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.date}</p>
                </div>
                <span className={cn("badge shrink-0",
                  item.urgency === "urgent" ? "badge-red" :
                  item.urgency === "warning" ? "badge-amber" : "badge-green"
                )}>
                  {item.daysLeft} วัน
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="card-premium p-5">
          <MiniCalendar />
        </div>

        {/* Recent activity */}
        <div className="card-premium p-5">
          <div className="section-header">
            <div className="section-header-icon bg-gray-100 dark:bg-gray-800">
              <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">รายการล่าสุด</h3>
            <button onClick={() => navigate("/accounting")} className="ml-auto text-[11px] font-medium text-green-600 dark:text-green-400 hover:underline">ดูทั้งหมด</button>
          </div>

          {recentTxs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[12px] text-gray-400">ยังไม่มีรายการ</p>
              <button onClick={() => navigate("/accounting")} className="mt-2 text-[11px] text-green-600 dark:text-green-400 font-medium hover:underline">
                + เพิ่มรายการแรก
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentTxs.map(tx => (
                <div key={tx.id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[11px] shrink-0",
                    tx.type === "income" ? "bg-green-100 dark:bg-green-950/40" : "bg-red-100 dark:bg-red-950/40"
                  )}>
                    {tx.type === "income" ? "💰" : "💸"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300 truncate">{tx.category}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(tx.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className={cn("text-[12px] font-semibold num tabular-nums shrink-0",
                    tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  )}>
                    {tx.type === "income" ? "+" : "−"}{(tx.amount / 1000).toFixed(1)}K
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Forecast teaser */}
      {forecast && (
        <div
          onClick={() => navigate("/forecast")}
          className="card-premium p-5 cursor-pointer group hover:border-green-200 dark:hover:border-green-900/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400">พยากรณ์ฤดูกาลหน้า</p>
                <p className="text-[14px] font-bold text-gray-900 dark:text-white">
                  รายรับคาด {formatBaht(forecast.forecastedIncome)}
                  <span className={cn("ml-2 text-[12px] font-semibold", forecast.yoyChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                    {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}% YoY
                  </span>
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all group-hover:translate-x-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}
