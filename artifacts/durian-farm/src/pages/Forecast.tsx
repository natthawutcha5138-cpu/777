import { useGetForecast, useGetMonthlyTrend, useGetDashboardSummary } from "@workspace/api-client-react";
import { getGetForecastQueryKey, getGetMonthlyTrendQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { formatBaht, MONTHS_TH } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Sparkles } from "lucide-react";

const currentYear = new Date().getFullYear();
const prevYear    = currentYear - 1;

export default function Forecast() {
  const { data: forecast,    isLoading: fLoading } = useGetForecast({ query: { queryKey: getGetForecastQueryKey() } });
  const { data: trend }   = useGetMonthlyTrend({ year: currentYear }, { query: { queryKey: getGetMonthlyTrendQueryKey({ year: currentYear }) } });
  const { data: prevSum } = useGetDashboardSummary({ year: prevYear    }, { query: { queryKey: getGetDashboardSummaryQueryKey({ year: prevYear    }) } });
  const { data: currSum } = useGetDashboardSummary({ year: currentYear }, { query: { queryKey: getGetDashboardSummaryQueryKey({ year: currentYear }) } });

  const chartData = trend?.map(t => ({
    month: MONTHS_TH[t.month - 1], รายรับ: t.income, รายจ่าย: t.expense, กำไร: t.netProfit,
  })) ?? [];

  return (
    <div className="space-y-5 pb-10">

      {/* Photo Banner Header */}
      <div className="relative h-32 rounded-3xl overflow-hidden shadow-lg">
        <img src="/images/durian-seasons-web.jpg" alt="ทุเรียน 4 ฤดู" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 via-orange-800/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow">พยากรณ์ฤดูกาลหน้า</h1>
              <p className="text-xs text-white/70 mt-0.5">คาดการณ์จากแนวโน้ม 3 ปีย้อนหลังและราคาตลาดส่งออก</p>
            </div>
          </div>
          <div className="flex gap-2 max-sm:hidden">
            {["/images/durian-flower.jpg", "/images/durian-thorns-web.jpg", "/images/durian-tree-web.jpg"].map((src, i) => (
              <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/30 shadow">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Season Stage Banner */}
      {forecast?.currentSeasonStage && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <p className="text-xs text-amber-600 font-semibold">ช่วงฤดูกาลปัจจุบัน</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5">{forecast.currentSeasonStage}</p>
          </div>
        </div>
      )}

      {/* Forecast Cards */}
      {fLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-3xl h-28 animate-pulse shadow-sm" />)}
        </div>
      ) : forecast ? (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                label: "รายรับที่คาดการณ์",
                val: forecast.forecastedIncome,
                sub: `ฤดูกาล ${currentYear + 1}`,
                bg: "from-green-50 to-emerald-100",
                iconBg: "bg-green-500",
                icon: <TrendingUp className="w-5 h-5 text-white" />,
                textCls: "text-green-700",
              },
              {
                label: "รายจ่ายที่คาดการณ์",
                val: forecast.forecastedExpense,
                sub: `เงินเฟ้อปัจจัยการผลิต ${forecast.inputCostInflation}%`,
                bg: "from-rose-50 to-pink-100",
                iconBg: "bg-rose-500",
                icon: <TrendingDown className="w-5 h-5 text-white" />,
                textCls: "text-rose-600",
              },
              {
                label: "กำไรสุทธิที่คาดการณ์",
                val: forecast.forecastedNetProfit,
                sub: `เทียบปีนี้ ${forecast.yoyChange >= 0 ? "+" : ""}${forecast.yoyChange}%`,
                bg: forecast.forecastedNetProfit >= 0 ? "from-amber-50 to-yellow-100" : "from-rose-50 to-pink-100",
                iconBg: forecast.forecastedNetProfit >= 0 ? "bg-amber-400" : "bg-rose-500",
                icon: forecast.forecastedNetProfit >= 0 ? <TrendingUp className="w-5 h-5 text-white" /> : <TrendingDown className="w-5 h-5 text-white" />,
                textCls: forecast.forecastedNetProfit >= 0 ? "text-amber-700" : "text-rose-600",
              },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-3xl p-5 shadow-sm`}>
                <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center shadow-md mb-3`}>
                  {s.icon}
                </div>
                <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${s.textCls}`}>{formatBaht(s.val)}</p>
                {s.sub && <p className="text-xs text-gray-400 mt-1.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Year Comparison Table */}
          {(currSum || prevSum) && (
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="text-base font-bold text-gray-800">เปรียบเทียบรายปี</span>
                <span className="ml-auto text-xs text-gray-400">3 ปี · ปัจจุบัน · คาดการณ์</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">รายการ</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">ปี {prevYear}</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">ปี {currentYear}</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-amber-500 uppercase tracking-wide">คาดการณ์ {currentYear + 1}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { lbl: "💰 รายรับ",    prev: prevSum?.totalIncome ?? 0,  curr: currSum?.totalIncome ?? 0,  fore: forecast.forecastedIncome,    pos: true  },
                    { lbl: "💸 รายจ่าย",   prev: prevSum?.totalExpense ?? 0, curr: currSum?.totalExpense ?? 0, fore: forecast.forecastedExpense,   pos: false },
                    { lbl: "🏆 กำไรสุทธิ", prev: prevSum?.netProfit ?? 0,    curr: currSum?.netProfit ?? 0,    fore: forecast.forecastedNetProfit, pos: forecast.forecastedNetProfit >= 0 },
                  ].map(row => (
                    <tr key={row.lbl} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-700">{row.lbl}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-gray-500">{formatBaht(row.prev)}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-gray-800">{formatBaht(row.curr)}</td>
                      <td className={`px-5 py-3.5 text-right tabular-nums font-bold ${row.pos ? "text-amber-600" : "text-rose-500"}`}>{formatBaht(row.fore)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-base font-bold text-gray-800">ข้อแนะนำสำหรับฤดูกาลหน้า</h2>
            </div>
            <div className="space-y-3">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 bg-purple-50/60 rounded-2xl p-4">
                  <span className="w-6 h-6 rounded-xl bg-purple-500 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-100">
              📊 อ้างอิง: แนวโน้มเฉลี่ย 3 ปี · เงินเฟ้อปัจจัยการผลิต {forecast.inputCostInflation}%/ปี · อุปสงค์ตลาดส่งออก
            </p>
          </div>
        </>
      ) : null}

      {/* Monthly Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">แนวโน้มรายเดือน ปี {currentYear}</h2>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />รายรับ</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />รายจ่าย</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />กำไร</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={v => (v / 1000).toFixed(0) + "K"} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => formatBaht(v)}
                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: 12 }}
                cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="รายรับ"  stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: "#22c55e" }} />
              <Line type="monotone" dataKey="รายจ่าย" stroke="#fb7185" strokeWidth={2.5} dot={{ r: 3, fill: "#fb7185" }} />
              <Line type="monotone" dataKey="กำไร"    stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3, fill: "#fbbf24" }} strokeDasharray="5 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
