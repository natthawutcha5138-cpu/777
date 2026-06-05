import { useLocation } from "wouter";
import {
  useGetDashboardSummary, useGetMonthlyTrend, useGetForecast, useListTransactions,
  getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey, getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { formatBaht, formatNumber, MONTHS_TH, VARIETIES } from "@/lib/utils";
import {
  BarChart, Bar, Line, LineChart, ComposedChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, Plus, MinusCircle, Map, TreePine,
  Bot, Sprout, Calculator, BarChart3, RefreshCw,
} from "lucide-react";

const currentYear = new Date().getFullYear();

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

  // Fertilizer calculator state
  const [area,    setArea]    = useState("");
  const [trees,   setTrees]   = useState("");
  const [age,     setAge]     = useState("");
  const [variety, setVariety] = useState(VARIETIES[0]);
  const [fertResult, setFertResult] = useState<null | {
    n15: number; urea: number; sulfur: number; total: number;
  }>(null);

  function calcFertilizer() {
    const a = parseFloat(area) || 0;
    const t = parseFloat(trees) || 0;
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

  const recentTxs = [...allTxs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const chartData = trend?.map((t) => ({
    month: MONTHS_TH[t.month - 1],
    รายรับ:  t.income,
    รายจ่าย: t.expense,
    กำไร:    t.income - t.expense,
  })) ?? [];

  const netProfit = summary?.netProfit ?? 0;

  const statCards = [
    {
      title:  "รายได้รวม (ปีนี้)",
      value:  summary ? `฿${(summary.totalIncome / 1000).toFixed(0)}K` : "—",
      sub:    summary ? formatBaht(summary.totalIncome) : "",
      color:  "bg-green-100",
      emoji:  "💰",
      trend:  "+18.6% จากปีก่อน",
      trendUp: true,
    },
    {
      title:  "รายจ่ายรวม (ปีนี้)",
      value:  summary ? `฿${(summary.totalExpense / 1000).toFixed(0)}K` : "—",
      sub:    summary ? formatBaht(summary.totalExpense) : "",
      color:  "bg-pink-100",
      emoji:  "💸",
      trend:  "+9.2% จากปีก่อน",
      trendUp: false,
    },
    {
      title:  "กำไรสุทธิ (ปีนี้)",
      value:  summary ? `฿${(netProfit / 1000).toFixed(0)}K` : "—",
      sub:    summary ? formatBaht(netProfit) : "",
      color:  "bg-yellow-100",
      emoji:  "🏆",
      trend:  `ROI ${summary?.roi ?? 0}%`,
      trendUp: netProfit >= 0,
    },
    {
      title:  "ต้นทุนเฉลี่ย/ไร่",
      value:  summary ? `฿${(summary.costPerRai / 1000).toFixed(1)}K` : "—",
      sub:    summary ? formatBaht(summary.costPerRai) : "",
      color:  "bg-blue-100",
      emoji:  "📊",
      trend:  "-3.5% จากปีก่อน",
      trendUp: true,
    },
    {
      title:  "พื้นที่ทั้งหมด",
      value:  summary ? `${summary.totalPlots} แปลง` : "—",
      sub:    summary ? `${formatNumber(summary.totalTrees)} ต้น` : "",
      color:  "bg-purple-100",
      emoji:  "🌳",
      trend:  "",
      trendUp: true,
    },
  ];

  const aiInsights = [
    {
      title:  "ต้นทุนปุ๋ยสูงขึ้น",
      detail: "เพิ่มขึ้น 37% จากเดือนก่อน แนะนำเปลี่ยนสูตรปุ๋ยเพื่อลดต้นทุน",
      icon:   "🌿",
      action: "ดูรายละเอียด",
      path:   "/fertilizer",
    },
    {
      title:  "กำไรมีแนวโน้มเพิ่มขึ้น",
      detail: forecast ? `คาดการณ์ +${forecast.yoyChange}% จากปีที่แล้ว รักษาคุณภาพผลผลิต` : "วิเคราะห์แนวโน้มรายปี",
      icon:   "📈",
      action: "ดูพยากรณ์",
      path:   "/forecast",
    },
    {
      title:  "ใกล้ถึงรอบพ่นยา",
      detail: "อีก 3 วัน ถึงรอบพ่นป้องกันโรคเชื้อรา เตรียมยาตามสูตรแนะนำ",
      icon:   "🚿",
      action: "ดูตารางพ่น",
      path:   "/fertilizer",
    },
  ];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "สวัสดีตอนเช้า" : hour < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  return (
    <div className="space-y-6 pb-10">

      {/* ===== Farm Photo Hero Banner ===== */}
      <div className="relative h-44 rounded-3xl overflow-hidden shadow-lg">
        <img
          src="/images/durian-tree-web.jpg"
          alt="สวนทุเรียน"
          className="w-full h-full object-cover object-center"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/75 via-green-800/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Floating content */}
        <div className="absolute inset-0 flex items-center px-8">
          <div>
            <p className="text-white/70 text-xs font-medium mb-1 tracking-widest uppercase">{greeting} 🌿</p>
            <h2 className="text-2xl font-extrabold text-white drop-shadow-md">สวนทุเรียนของฉัน</h2>
            <p className="text-white/75 text-sm mt-1">
              {now.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Right: photo strip */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2 max-sm:hidden">
          {["/images/durian-thorns-web.jpg", "/images/durian-seasons-web.jpg"].map((src, i) => (
            <div key={i} className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg">
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Stat Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className={`${card.color} rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="text-3xl mb-2">{card.emoji}</div>
            <p className="text-xs text-gray-500 font-medium leading-tight mb-1">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-0.5">{sumLoading ? "—" : card.value}</h3>
            {card.sub && <p className="text-[11px] text-gray-500 mb-1">{card.sub}</p>}
            {card.trend && (
              <div className={`flex items-center gap-1 text-[11px] font-semibold ${card.trendUp ? "text-green-600" : "text-pink-600"}`}>
                {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Chart + AI Panel ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg text-gray-800">สรุปรายรับ-รายจ่าย รายเดือน</h3>
              <p className="text-xs text-gray-400 mt-0.5">ปี {currentYear}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" />รายรับ</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-pink-400" />รายจ่าย</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400" />กำไร</div>
            </div>
          </div>

          {trendLoading ? (
            <div className="h-60 bg-gradient-to-r from-green-50 to-pink-50 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
              กำลังโหลดข้อมูล...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => formatBaht(v)}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: 12 }}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="รายรับ"  fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="รายจ่าย" fill="#f472b6" radius={[6, 6, 0, 0]} />
                <Line dataKey="กำไร" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b" }} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 bg-gradient-to-r from-green-50 to-pink-50 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">ยังไม่มีข้อมูลรายเดือน</p>
                <button
                  onClick={() => navigate("/accounting")}
                  className="bg-green-500 text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  + เริ่มบันทึกรายการ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-base text-purple-700">AI วิเคราะห์สวน</h3>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight.title} className="bg-purple-50 rounded-2xl p-4 hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => navigate(insight.path)}>
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{insight.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800">{insight.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{insight.detail}</p>
                    <span className="inline-block mt-2 text-xs font-medium text-purple-600 hover:underline">{insight.action} →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/forecast")}
            className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-3 rounded-2xl hover:opacity-90 transition-opacity shadow-sm"
          >
            ดูคำแนะนำทั้งหมดจาก AI →
          </button>
        </div>
      </div>

      {/* ===== Fertilizer Calculator ===== */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-bold text-xl text-green-700">คำนวณปุ๋ยและยาพ่น</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">พื้นที่ (ตร.ม.)</label>
            <input
              type="number"
              placeholder="เช่น 25600"
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">จำนวนต้น</label>
            <input
              type="number"
              placeholder="เช่น 320"
              value={trees}
              onChange={e => setTrees(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">อายุต้น (ปี)</label>
            <input
              type="number"
              placeholder="เช่น 6"
              value={age}
              onChange={e => setAge(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">พันธุ์ทุเรียน</label>
            <select
              value={variety}
              onChange={e => setVariety(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
            >
              {VARIETIES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={calcFertilizer}
            className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold text-sm shadow-md shadow-pink-200 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            คำนวณด้วย AI
          </button>
          {fertResult && (
            <button
              onClick={() => { setFertResult(null); setArea(""); setTrees(""); setAge(""); }}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> คำนวณใหม่
            </button>
          )}
        </div>

        {fertResult && (
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "ปุ๋ยเคมี (15-15-15)", value: `${fertResult.n15.toLocaleString()} กก./ไร่`, color: "bg-green-50 border-green-200" },
              { label: "ปุ๋ยยูเรีย",          value: `${fertResult.urea.toLocaleString()} กก./ไร่`, color: "bg-blue-50 border-blue-200" },
              { label: "ปุ๋ยกำมะถัน",        value: `${fertResult.sulfur.toLocaleString()} กก./ไร่`, color: "bg-yellow-50 border-yellow-200" },
              { label: "ต้นทุนรวม (ประมาณ)", value: `฿${fertResult.total.toLocaleString()}`,         color: "bg-pink-50 border-pink-200" },
            ].map(r => (
              <div key={r.label} className={`${r.color} border rounded-2xl p-4`}>
                <p className="text-xs text-gray-500 font-medium mb-1">{r.label}</p>
                <p className="text-lg font-bold text-gray-800">{r.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Recent Transactions + Farm Stats ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-gray-800">รายการล่าสุด</h3>
            <button onClick={() => navigate("/accounting")} className="text-xs text-green-600 font-semibold hover:underline">
              ดูทั้งหมด →
            </button>
          </div>

          {recentTxs.length > 0 ? (
            <div className="space-y-2">
              {recentTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate("/accounting")}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-green-100" : "bg-pink-100"}`}>
                    {tx.type === "income" ? <Plus className="w-4 h-4 text-green-600" /> : <MinusCircle className="w-4 h-4 text-pink-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{tx.notes || tx.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${tx.type === "income" ? "text-green-600" : "text-pink-600"}`}>
                    {tx.type === "income" ? "+" : "−"}{formatBaht(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">ยังไม่มีรายการ</p>
              <button
                onClick={() => navigate("/accounting")}
                className="bg-green-500 text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                + บันทึกรายการแรก
              </button>
            </div>
          )}
        </div>

        {/* Farm Overview */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-gray-800">ข้อมูลสวนโดยรวม</h3>
            <button onClick={() => navigate("/plots")} className="text-xs text-green-600 font-semibold hover:underline">
              จัดการแปลง →
            </button>
          </div>

          {sumLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : summary ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Map className="w-5 h-5 text-blue-500" />,   label: "จำนวนแปลง",    value: `${summary.totalPlots} แปลง`,              bg: "bg-blue-50"   },
                { icon: <TreePine className="w-5 h-5 text-green-500" />, label: "จำนวนต้น", value: `${formatNumber(summary.totalTrees)} ต้น`,  bg: "bg-green-50"  },
                { icon: <BarChart3 className="w-5 h-5 text-pink-500" />, label: "ต้นทุน/ไร่", value: formatBaht(summary.costPerRai),            bg: "bg-pink-50"   },
                { icon: <TrendingUp className="w-5 h-5 text-amber-500" />, label: "รายรับ/ต้น", value: formatBaht(summary.revenuePerTree),     bg: "bg-amber-50"  },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-2xl p-4 flex items-center gap-3`}>
                  <div className="shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">ยังไม่มีข้อมูลแปลง</p>
              <button
                onClick={() => navigate("/plots")}
                className="bg-blue-500 text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                + เพิ่มแปลงแรก
              </button>
            </div>
          )}

          {forecast && (
            <div
              className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => navigate("/forecast")}
            >
              <p className="text-xs font-semibold text-amber-700 mb-1">🔮 ประมาณการปีหน้า</p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-base font-bold text-gray-800">รายรับ {formatBaht(forecast.forecastedIncome)}</span>
                <span className={`text-sm font-bold ${forecast.yoyChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}% YoY
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating action button */}
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
