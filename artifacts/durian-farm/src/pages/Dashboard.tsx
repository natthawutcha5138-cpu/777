import { useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  useGetDashboardSummary, useGetMonthlyTrend, useGetForecast, useListTransactions,
  getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey, getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { formatBaht, MONTHS_TH, VARIETIES } from "@/lib/utils";
import {
  BarChart, Bar, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid,
} from "recharts";
import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Plus, Calculator, Sprout, Bot, Leaf,
  CalendarCheck, MessageSquare, ChevronRight, Zap, Target,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const BE_YEAR = currentYear + 543;

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800", className)} />;
}

function useAnimatedCounter(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

const spraySchedule = [
  { task: "ใส่ปุ๋ยครั้งที่ 3", date: "25 พ.ค.", daysLeft: 3,  color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  { task: "พ่นป้องกันเชื้อรา", date: "28 พ.ค.", daysLeft: 6,  color: "text-amber-600 dark:text-amber-400",    dot: "bg-amber-500"   },
  { task: "พ่นสารบำรุงใบ",    date: "5 มิ.ย.",  daysLeft: 14, color: "text-blue-600 dark:text-blue-400",      dot: "bg-blue-500"    },
];

const calendarTasks: Record<number, string> = { 5: "🌿", 12: "💧", 18: "✂️", 25: "🌱", 28: "🚿" };

const aiRecommendations = [
  {
    level: "urgent", badge: "เร่งด่วน", badgeColor: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    title: "ต้นทุนปุ๋ยสูงเกินเกณฑ์",
    detail: "ต้นทุนปุ๋ยเพิ่มขึ้น 37% จากเดือนก่อน ควรเปลี่ยนสูตรปุ๋ยเพื่อลดต้นทุนทันที",
    action: "ดูรายละเอียด", path: "/fertilizer",
  },
  {
    level: "warning", badge: "ควรทำ", badgeColor: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    title: "ใกล้ถึงรอบพ่นยา",
    detail: "อีก 3 วัน ถึงรอบพ่นป้องกันโรคเชื้อรา เตรียมยาตามสูตรแนะนำ",
    action: "ดูตาราง", path: "/fertilizer",
  },
  {
    level: "info", badge: "แนะนำ", badgeColor: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
    dot: "bg-green-500",
    title: "กำไรมีแนวโน้มเพิ่มขึ้น",
    detail: "คาดการณ์กำไรปีนี้เพิ่มขึ้น 28% รักษาคุณภาพผลผลิตต่อเนื่อง",
    action: "ดูพยากรณ์", path: "/forecast",
  },
];

const quickActions = [
  { label: "บันทึกรายการ", icon: Plus,       path: "/accounting",  color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-950/70" },
  { label: "คำนวณปุ๋ย",   icon: Calculator,  path: "/fertilizer",  color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70"   },
  { label: "ดูแปลง",      icon: Sprout,      path: "/plots",       color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70" },
  { label: "พยากรณ์",     icon: TrendingUp,  path: "/forecast",    color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-950/70" },
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

  const cells: (number | null)[] = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{monthNames[month]} {year + 543}</p>
        <div className="flex gap-2 text-[10px] text-gray-400">
          {Object.entries(calendarTasks).map(([d, emoji]) => (
            <span key={d}>{emoji}={d}</span>
          )).slice(0,2)}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square flex items-center justify-center text-[11px] rounded-lg relative",
              !day && "opacity-0",
              day === today && "bg-green-600 text-white font-bold",
              day !== today && day && "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer",
              day && calendarTasks[day] && day !== today && "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 font-semibold",
            )}
          >
            {day || ""}
            {day && calendarTasks[day] && (
              <span className="absolute -top-0.5 -right-0.5 text-[8px]">{calendarTasks[day]}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Object.entries(calendarTasks).map(([d, emoji]) => (
          <span key={d} className="text-[10px] text-gray-400">{emoji} วันที่ {d}</span>
        ))}
      </div>
    </div>
  );
}

function FarmScore({ score }: { score: number }) {
  const animated = useAnimatedCounter(score, 1200);
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
  const dash = 2 * Math.PI * 32;
  const offset = dash - (animated / 100) * dash;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx="36" cy="36" r="32" fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-100 dark:text-gray-800" />
          <circle cx="36" cy="36" r="32" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={dash} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">{animated}</span>
          <span className="text-[10px] text-gray-400">/100</span>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Farm Score</p>
        <p className="text-base font-bold" style={{ color }}>
          {score >= 80 ? "ดีเยี่ยม 🌟" : score >= 60 ? "ดี 👍" : "ต้องปรับปรุง"}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">อัปเดตล่าสุดวันนี้</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-3 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{Number(p.value).toLocaleString("th-TH")} ฿</span>
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

  const netProfit = summary?.netProfit ?? 0;
  const incomeCount = useAnimatedCounter(sumLoading ? 0 : (summary?.totalIncome ?? 0));
  const expenseCount = useAnimatedCounter(sumLoading ? 0 : (summary?.totalExpense ?? 0));
  const profitCount = useAnimatedCounter(sumLoading ? 0 : Math.abs(netProfit));

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
    .slice(0, 5);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "อรุณสวัสดิ์" : hour < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">

      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting} 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {now.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map(({ label, icon: Icon, path, color, bg }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn("hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all", bg, color)}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate("/accounting")}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-green-200 dark:shadow-green-900/30"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการ
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sumLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            {[
              {
                label: "รายรับรวม (ปีนี้)", value: incomeCount, prefix: "฿",
                change: "+18.6%", up: true,
                sub: `${(summary?.totalIncome ?? 0) > 0 ? ((summary!.totalIncome) / 1000).toFixed(0) + "K" : "—"} บาท`,
                icon: <ArrowUpRight className="w-4 h-4" />, iconBg: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
              },
              {
                label: "รายจ่ายรวม (ปีนี้)", value: expenseCount, prefix: "฿",
                change: "+9.2%", up: false,
                sub: `${(summary?.totalExpense ?? 0) > 0 ? ((summary!.totalExpense) / 1000).toFixed(0) + "K" : "—"} บาท`,
                icon: <ArrowDownRight className="w-4 h-4" />, iconBg: "bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400",
              },
              {
                label: "กำไรสุทธิ (ปีนี้)", value: profitCount, prefix: netProfit < 0 ? "-฿" : "฿",
                change: `ROI ${summary?.roi ?? 0}%`, up: netProfit >= 0,
                sub: `${Math.abs(netProfit) > 0 ? (Math.abs(netProfit) / 1000).toFixed(0) + "K" : "—"} บาท`,
                icon: <TrendingUp className="w-4 h-4" />, iconBg: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
              },
              {
                label: "ต้นทุนเฉลี่ย/ไร่", value: summary?.costPerRai ?? 0, prefix: "฿",
                change: "-3.5%", up: true,
                sub: `${summary?.totalPlots ?? 0} แปลง · ${summary?.totalTrees?.toLocaleString("th-TH") ?? 0} ต้น`,
                icon: <Activity className="w-4 h-4" />, iconBg: "bg-blue-100 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400",
              },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{card.label}</p>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", card.iconBg)}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                  {card.prefix}{card.value.toLocaleString("th-TH")}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 mb-2">{card.sub}</p>
                {card.change && (
                  <div className={cn("flex items-center gap-1 text-[11px] font-semibold", card.up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                    {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.change}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Main layout: chart left, right column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT: Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">รายรับ-รายจ่าย รายเดือน</h3>
              <p className="text-xs text-gray-400 mt-0.5">ปี {BE_YEAR}</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              {[{label:"รายรับ",color:"#16a34a"},{label:"รายจ่าย",color:"#ef4444"},{label:"กำไร",color:"#f59e0b"}].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {trendLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="รายรับ"  fill="#16a34a" radius={[4,4,0,0]} maxBarSize={16} opacity={0.85} />
                <Bar dataKey="รายจ่าย" fill="#ef4444" radius={[4,4,0,0]} maxBarSize={16} opacity={0.75} />
                <Line dataKey="กำไร" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 rounded-xl bg-gray-50 dark:bg-gray-800/40 flex flex-col items-center justify-center gap-3">
              <p className="text-sm text-gray-400">ยังไม่มีข้อมูลรายเดือน</p>
              <button onClick={() => navigate("/accounting")} className="bg-green-600 text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors">
                + เริ่มบันทึกรายการ
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Farm Score + AI */}
        <div className="space-y-4">

          {/* Farm Score */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Farm Health Score</h3>
            </div>
            <FarmScore score={farmScore} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "ข้อมูล", val: allTxs.length > 5 ? "ดี" : "น้อย", ok: allTxs.length > 5 },
                { label: "กำไร",  val: netProfit > 0 ? "บวก" : "ลบ",      ok: netProfit > 0 },
                { label: "แปลง",  val: `${summary?.totalPlots ?? 0} แปลง`,  ok: (summary?.totalPlots ?? 0) > 0 },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-2 text-center">
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                  <p className={cn("text-xs font-bold mt-0.5", item.ok ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI วิเคราะห์</h3>
            </div>
            <div className="space-y-2.5">
              {aiRecommendations.map(r => (
                <div
                  key={r.title}
                  onClick={() => navigate(r.path)}
                  className="flex items-start gap-2.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors group"
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", r.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", r.badgeColor)}>{r.badge}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{r.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{r.detail}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5 transition-colors" />
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/forecast")}
              className="mt-3 w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              ดูคำแนะนำทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Schedule + Calendar + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Spray Schedule */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">งานที่ใกล้ถึง</h3>
            </div>
            <button onClick={() => navigate("/fertilizer")} className="text-[11px] text-green-600 dark:text-green-400 font-medium hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="space-y-2.5">
            {spraySchedule.map(item => (
              <div key={item.task} className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full shrink-0", item.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.task}</p>
                  <p className="text-[10px] text-gray-400">{item.date}</p>
                </div>
                <span className={cn("text-[10px] font-bold shrink-0 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-800", item.color)}>
                  {item.daysLeft}ว.
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
              อัปเดตตามฤดูกาลทุเรียน
            </p>
          </div>
        </div>

        {/* Mini Calendar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">ปฏิทินสวน</h3>
          </div>
          <MiniCalendar />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">รายการล่าสุด</h3>
            </div>
            <button onClick={() => navigate("/accounting")} className="text-[11px] text-green-600 dark:text-green-400 font-medium hover:underline">ดูทั้งหมด</button>
          </div>

          {recentTxs.length > 0 ? (
            <div className="space-y-2.5">
              {recentTxs.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/accounting")}>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0", tx.type === "income" ? "bg-green-50 dark:bg-green-950/40" : "bg-red-50 dark:bg-red-950/40")}>
                    {tx.type === "income" ? "💰" : "💸"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{tx.notes || tx.category}</p>
                    <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className={cn("text-xs font-bold shrink-0", tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                    {tx.type === "income" ? "+" : "−"}{tx.amount.toLocaleString("th-TH")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <p className="text-xs text-gray-400">ยังไม่มีรายการ</p>
              <button onClick={() => navigate("/accounting")} className="text-xs text-green-600 dark:text-green-400 font-medium hover:underline">+ บันทึกรายการแรก</button>
            </div>
          )}
        </div>
      </div>

      {/* Forecast teaser */}
      {forecast && (
        <div
          onClick={() => navigate("/forecast")}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-900/40 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-200 dark:shadow-green-900/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ประมาณการฤดูกาลหน้า</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                รายรับ {formatBaht(forecast.forecastedIncome)}
                <span className={cn("ml-2 text-sm font-semibold", forecast.yoyChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                  {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}% YoY
                </span>
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </div>
      )}

      {/* Quick Actions mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {quickActions.map(({ label, icon: Icon, path, color, bg }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn("flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all", bg, color)}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/accounting")}
        className="fixed bottom-6 right-6 w-13 h-13 w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-xl shadow-green-200 dark:shadow-green-900/40 flex items-center justify-center transition-all hover:scale-105 z-40"
        title="บันทึกรายการ"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
