import { useLocation } from "wouter";
import {
  useGetDashboardSummary, useGetMonthlyTrend, useGetForecast, useListTransactions,
  getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey, getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { formatBaht, formatNumber, MONTHS_TH, VARIETIES } from "@/lib/utils";
import {
  BarChart, Bar, Line, ComposedChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, Calculator, RefreshCw,
  Bot, Leaf, Sprout, Droplets, CalendarCheck, MessageSquare,
  Plus, ChevronRight,
} from "lucide-react";

const currentYear = new Date().getFullYear();
const BE_YEAR = currentYear + 543;

const spraySchedule = [
  { task: "ใส่ปุ๋ยครั้งที่ 3", date: "25 พ.ค. 2567", daysLeft: 3,  color: "text-green-600",  bg: "bg-green-50",  icon: "🌿" },
  { task: "พ่นป้องกันเชื้อรา", date: "28 พ.ค. 2567", daysLeft: 6,  color: "text-orange-500", bg: "bg-orange-50", icon: "🚿" },
  { task: "พ่นสารบำรุงใบ",   date: "5 มิ.ย. 2567",  daysLeft: 14, color: "text-blue-500",   bg: "bg-blue-50",   icon: "🌱" },
];

export default function Dashboard() {
  const [, navigate] = useLocation();

  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary(
    { year: currentYear },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ year: currentYear }) } }
  );
  const { data: trend, isLoading: trendLoading } = useGetMonthlyTrend(
    { year: currentYear },
    { query: { queryKey: getGetMonthlyTrendQueryKey({ year: currentYear }) } }
  );
  const { data: forecast } = useGetForecast({ query: { queryKey: getGetForecastQueryKey() } });
  const { data: allTxs = [] } = useListTransactions(
    { year: currentYear },
    { query: { queryKey: getListTransactionsQueryKey({ year: currentYear }) } }
  );

  const [area,    setArea]    = useState("25,600");
  const [trees,   setTrees]   = useState("320");
  const [age,     setAge]     = useState("6");
  const [variety, setVariety] = useState(VARIETIES[0]);
  const [fertResult, setFertResult] = useState<null | {
    n15: number; urea: number; sulfur: number; total: number;
  }>(null);

  function calcFertilizer() {
    const a = parseFloat(area.replace(/,/g, "")) || 0;
    const t = parseFloat(trees.replace(/,/g, "")) || 0;
    const ag = parseFloat(age) || 1;
    if (!a && !t) return;
    const base = a ? a * 50 : t * 6;
    const ageFactor = Math.min(3, 1 + ag * 0.1);
    const n15 = Math.round(base * ageFactor);
    const urea = Math.round(base * ageFactor * 2);
    const sulfur = Math.round(base * ageFactor * 0.5);
    const total = Math.round((n15 + urea + sulfur) * (a || t * 0.02));
    setFertResult({ n15, urea, sulfur, total });
  }

  const chartData = trend?.map((t) => ({
    month: MONTHS_TH[t.month - 1],
    รายรับ:  t.income,
    รายจ่าย: t.expense,
    กำไร:    t.income - t.expense,
  })) ?? [];

  const netProfit = summary?.netProfit ?? 0;

  const statCards = [
    {
      title: "รายได้รวม (ปีนี้)",
      value: summary ? (summary.totalIncome / 1000).toFixed(0) + "K" : "—",
      sub: summary ? summary.totalIncome.toLocaleString("th-TH") + " บาท" : "",
      trend: "+18.6% จากปีก่อน", trendUp: true,
      bg: "bg-gradient-to-br from-green-400 to-green-500", icon: "💰",
    },
    {
      title: "รายจ่ายรวม (ปีนี้)",
      value: summary ? (summary.totalExpense / 1000).toFixed(0) + "K" : "—",
      sub: summary ? summary.totalExpense.toLocaleString("th-TH") + " บาท" : "",
      trend: "+9.2% จากปีก่อน", trendUp: false,
      bg: "bg-gradient-to-br from-pink-400 to-rose-500", icon: "💳",
    },
    {
      title: "กำไรสุทธิ (ปีนี้)",
      value: summary ? (netProfit / 1000).toFixed(0) + "K" : "—",
      sub: summary ? netProfit.toLocaleString("th-TH") + " บาท" : "",
      trend: "+28.4% จากปีก่อน", trendUp: true,
      bg: "bg-gradient-to-br from-amber-400 to-yellow-500", icon: "🏆",
    },
    {
      title: "ต้นทุนเฉลี่ย/ไร่",
      value: summary ? (summary.costPerRai).toLocaleString("th-TH") : "—",
      sub: summary ? formatBaht(summary.costPerRai) : "",
      trend: "-3.5% จากปีก่อน", trendUp: true,
      bg: "bg-gradient-to-br from-sky-400 to-blue-500", icon: "🧮",
    },
    {
      title: "พื้นที่รวม",
      value: summary ? `${summary.totalPlots} แปลง` : "—",
      sub: summary ? `จำนวนต้น ${formatNumber(summary.totalTrees)} ต้น` : "",
      trend: "", trendUp: true,
      bg: "bg-gradient-to-br from-violet-400 to-purple-500", icon: "🌳",
    },
  ];

  const aiInsights = [
    {
      title: "ต้นทุนปุ๋ยสูงขึ้น",
      detail: "ต้นทุนปุ๋ยเพิ่มขึ้น 37% ของต้นทุนทั้งหมด แนะนำ เปลี่ยนสูตรปุ๋ยเพื่อลดต้นทุน",
      action: "ดูรายละเอียด", path: "/fertilizer",
      bg: "bg-green-50", iconBg: "bg-green-100", emoji: "🌿",
    },
    {
      title: "กำไรมีแนวโน้มเพิ่มขึ้น",
      detail: forecast ? `คาดการณ์กำไรปีนี้เพิ่มขึ้น ${forecast.yoyChange}% แนะนำ: รักษาคุณภาพผลผลิตต่อเนื่อง` : "วิเคราะห์แนวโน้มรายปี",
      action: "ดูพยากรณ์", path: "/forecast",
      bg: "bg-blue-50", iconBg: "bg-blue-100", emoji: "📈",
    },
    {
      title: "ใกล้ถึงรอบพ่นยา",
      detail: "อีก 3 วัน ถึงรอบพ่นป้องกันโรคเชื้อรา เตรียมยาตามสูตรแนะนำ",
      action: "ดูตารางพ่นยา", path: "/fertilizer",
      bg: "bg-orange-50", iconBg: "bg-orange-100", emoji: "🚿",
    },
  ];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "สวัสดีตอนเช้า" : hour < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  return (
    <div className="space-y-5 pb-10">

      {/* ===== Greeting header ===== */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {greeting}, เจ้าของสวน <span>🌿</span>
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">ภาพรวมการดำเนินงานของสวนทุเรียน</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">{now.toLocaleDateString("th-TH", { weekday: "long" })}</p>
          <p className="text-xs font-semibold text-gray-600">
            {now.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div key={card.title} className={`${card.bg} rounded-2xl p-4 shadow-md text-white relative overflow-hidden`}>
            <div className="absolute -right-2 -top-2 text-4xl opacity-20">{card.icon}</div>
            <div className="text-2xl mb-1">{card.icon}</div>
            <p className="text-[11px] font-medium text-white/80 leading-tight mb-0.5">{card.title}</p>
            <h3 className="text-xl font-extrabold text-white">
              {sumLoading ? "—" : card.value}
            </h3>
            {card.sub && <p className="text-[10px] text-white/70 mt-0.5 leading-tight">{card.sub}</p>}
            {card.trend && (
              <div className="flex items-center gap-0.5 mt-1.5 text-[10px] font-semibold text-white/90">
                {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Main 2-column area ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT COLUMN (chart + calculator) */}
        <div className="xl:col-span-2 space-y-5">

          {/* Monthly Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌟</span>
                <div>
                  <h3 className="font-bold text-sm text-gray-800">สรุปรายรับ-รายจ่าย รายเดือน (ปี {BE_YEAR})</h3>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-400" />รายรับ</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-pink-400" />รายจ่าย</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" />กำไร</div>
                <select className="border border-gray-200 rounded-lg px-2 py-1 text-[11px] bg-white text-gray-600">
                  <option>ปี {BE_YEAR}</option>
                </select>
              </div>
            </div>

            {trendLoading ? (
              <div className="h-52 bg-green-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
                กำลังโหลด...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => v.toLocaleString("th-TH") + " บาท"}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  />
                  <Bar dataKey="รายรับ"  fill="#4ade80" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="รายจ่าย" fill="#f472b6" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Line dataKey="กำไร" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b" }} type="monotone" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 bg-green-50 rounded-xl flex flex-col items-center justify-center gap-3">
                <p className="text-gray-400 text-sm">ยังไม่มีข้อมูลรายเดือน</p>
                <button onClick={() => navigate("/accounting")} className="bg-green-500 text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-green-600">
                  + เริ่มบันทึกรายการ
                </button>
              </div>
            )}
          </div>

          {/* Fertilizer Calculator */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌱</span>
              <h3 className="font-bold text-sm text-gray-800">คำนวณปุ๋ยและยาพ่น</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Input table */}
              <div className="md:col-span-1 bg-gray-50 rounded-xl p-4">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-3">ข้อมูลสวน</p>
                <div className="space-y-2.5">
                  {[
                    { label: "พื้นที่ (ตร.ม.)", val: area, set: setArea, placeholder: "25600" },
                    { label: "จำนวนต้น",       val: trees, set: setTrees, placeholder: "320" },
                    { label: "อายุต้น (ปี)",    val: age,   set: setAge,   placeholder: "6" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[11px] text-gray-400 font-medium">{f.label}</label>
                      <input
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium">พันธุ์ทุเรียน</label>
                    <select
                      value={variety}
                      onChange={e => setVariety(e.target.value)}
                      className="w-full mt-0.5 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                      {VARIETIES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="md:col-span-1 space-y-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">ผลการคำนวณปุ๋ย</p>
                {[
                  { label: "ปุ๋ยเคมี (สูตร 15-15-15)", value: fertResult ? `${fertResult.n15.toLocaleString()} กก./ไร่` : "—", color: "text-green-700", bg: "bg-green-50" },
                  { label: "ปุ๋ยยูเรีย",              value: fertResult ? `${fertResult.urea.toLocaleString()} กก./ไร่` : "—",  color: "text-blue-700",  bg: "bg-blue-50"  },
                  { label: "ปุ๋ยกำมะถัน",            value: fertResult ? `${fertResult.sulfur.toLocaleString()} กก./ไร่` : "—", color: "text-amber-700", bg: "bg-amber-50" },
                  { label: "ต้นทุนรวม (ประมาณ)",    value: fertResult ? `฿${fertResult.total.toLocaleString()}` : "—",           color: "text-pink-700",  bg: "bg-pink-50"  },
                ].map(r => (
                  <div key={r.label} className={`${r.bg} rounded-xl px-3 py-2 flex items-center justify-between`}>
                    <span className="text-xs text-gray-500">{r.label}</span>
                    <span className={`text-sm font-bold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Example + Button */}
              <div className="md:col-span-1">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">ตัวอย่างการคำนวณ</p>
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed mb-3">
                  <p>อัตราการใช้ปุ๋ย 50 กรัม/ตร.ม.</p>
                  <p>พื้นที่ 25,600 ตร.ม.</p>
                  <p className="mt-1 font-medium text-green-700">25,600 × 50 กรัม<br />= 1,280,000 กรัม<br />= <strong>1,280 กิโลกรัม</strong></p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={calcFertilizer}
                    className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:opacity-90 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-pink-100 flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> คำนวณใหม่
                  </button>
                  <button
                    onClick={() => navigate("/fertilizer")}
                    className="w-full border border-green-300 text-green-700 py-2 rounded-xl text-sm font-medium hover:bg-green-50 transition-colors"
                  >
                    ไปหน้าคำนวณเต็ม →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">

          {/* AI Analysis Panel */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-sm text-purple-700">AI วิเคราะห์สวนของคุณ</h3>
            </div>

            <div className="space-y-2.5">
              {aiInsights.map((ins) => (
                <div
                  key={ins.title}
                  className={`${ins.bg} rounded-xl p-3 cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => navigate(ins.path)}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`${ins.iconBg} w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base`}>
                      {ins.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-gray-800">{ins.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{ins.detail}</p>
                      <span className="text-[11px] font-semibold text-purple-600 mt-1 inline-block">{ins.action} →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/forecast")}
              className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-1.5"
            >
              ดูคำแนะนำทั้งหมดจาก AI <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Spray / Fertilizer Schedule */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-green-600" />
                <h3 className="font-bold text-sm text-gray-800">ตารางพ่นยา/ใส่ปุ๋ย (ถัดไป)</h3>
              </div>
              <button onClick={() => navigate("/fertilizer")} className="text-[11px] text-green-600 font-semibold hover:underline">
                ดูทั้งหมด →
              </button>
            </div>

            <div className="space-y-2">
              {spraySchedule.map((item) => (
                <div key={item.task} className={`${item.bg} rounded-xl p-3 flex items-center gap-3`}>
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800">{item.task}</p>
                    <p className="text-[11px] text-gray-500">{item.date}</p>
                  </div>
                  <span className={`text-[11px] font-bold ${item.color} shrink-0`}>
                    อีก {item.daysLeft} วัน
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Chat Prompt */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">มีคำถามเกี่ยวกับทุเรียน?</p>
                <p className="text-[11px] text-gray-500 mt-0.5">AI ผู้ช่วยพร้อมให้คำแนะนำ</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/forecast")}
              className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold py-2.5 rounded-xl hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Bot className="w-3.5 h-3.5" /> ถาม AI 💬
            </button>
          </div>

          {/* Quick Recent Transactions */}
          {allTxs.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-gray-800">รายการล่าสุด</h3>
                <button onClick={() => navigate("/accounting")} className="text-[11px] text-green-600 font-semibold hover:underline">
                  ดูทั้งหมด →
                </button>
              </div>
              <div className="space-y-1.5">
                {[...allTxs]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map(tx => (
                    <div key={tx.id} className="flex items-center gap-2.5 py-1.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-green-100" : "bg-pink-100"}`}>
                        <span className="text-sm">{tx.type === "income" ? "💰" : "💸"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{tx.notes || tx.category}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(tx.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${tx.type === "income" ? "text-green-600" : "text-pink-600"}`}>
                        {tx.type === "income" ? "+" : "−"}{tx.amount.toLocaleString("th-TH")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add button */}
      <button
        onClick={() => navigate("/accounting")}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-xl shadow-green-200 hover:shadow-2xl flex items-center justify-center transition-all hover:scale-105 z-40 group"
        title="บันทึกรายการ"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}
