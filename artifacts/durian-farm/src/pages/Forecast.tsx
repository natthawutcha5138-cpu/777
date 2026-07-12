import { useGetForecast, useGetMonthlyTrend, useGetDashboardSummary } from "@workspace/api-client-react";
import { getGetForecastQueryKey, getGetMonthlyTrendQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { formatBaht, MONTHS_TH } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartTooltip } from "@/components/charts/ChartTooltip";

const currentYear = new Date().getFullYear();
const prevYear    = currentYear - 1;

export default function Forecast() {
  const { data: forecast, isLoading: fLoading } = useGetForecast({ query: { queryKey: getGetForecastQueryKey() } });
  const { data: trend   } = useGetMonthlyTrend({ year: currentYear }, { query: { queryKey: getGetMonthlyTrendQueryKey({ year: currentYear }) } });
  const { data: prevSum } = useGetDashboardSummary({ year: prevYear    }, { query: { queryKey: getGetDashboardSummaryQueryKey({ year: prevYear    }) } });
  const { data: currSum } = useGetDashboardSummary({ year: currentYear }, { query: { queryKey: getGetDashboardSummaryQueryKey({ year: currentYear }) } });

  const chartData = trend?.map(t => ({
    month: MONTHS_TH[t.month - 1], รายรับ: t.income, รายจ่าย: t.expense, กำไร: t.netProfit,
  })) ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">

      {/* ── Page Header ── */}
      <div className="relative h-28 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <img src="/images/durian-seasons-web.jpg" alt="ทุเรียน 4 ฤดู" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/75 via-gray-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
              <BarChart3 className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-white tracking-tight">พยากรณ์ฤดูกาลหน้า</h1>
              <p className="text-[11px] text-white/60 mt-0.5">คาดการณ์จากแนวโน้ม 3 ปีย้อนหลังและราคาตลาดส่งออก</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Season Stage Banner ── */}
      {forecast?.currentSeasonStage && (
        <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl">
          <span className="text-2xl shrink-0">🌿</span>
          <div>
            <p className="text-[11px] text-amber-600 dark:text-amber-500 font-semibold uppercase tracking-wider">ช่วงฤดูกาลปัจจุบัน</p>
            <p className="text-[14px] font-bold text-gray-800 dark:text-gray-200 mt-0.5">{forecast.currentSeasonStage}</p>
          </div>
        </div>
      )}

      {/* ── Forecast Cards ── */}
      {fLoading ? (
        <div className="grid md:grid-cols-3 gap-4 stagger">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-[120px]" />)}
        </div>
      ) : forecast ? (
        <div className="stagger">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                label: "รายรับที่คาดการณ์",
                val: forecast.forecastedIncome,
                sub: `ฤดูกาล ${currentYear + 1}`,
                icon: ArrowUpRight, iconBg: "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400",
                valCls: "text-green-700 dark:text-green-400", accentClass: "green",
              },
              {
                label: "รายจ่ายที่คาดการณ์",
                val: forecast.forecastedExpense,
                sub: `เงินเฟ้อ ${forecast.inputCostInflation}%/ปี`,
                icon: ArrowDownRight, iconBg: "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400",
                valCls: "text-red-600 dark:text-red-400", accentClass: "red",
              },
              {
                label: "กำไรสุทธิคาดการณ์",
                val: forecast.forecastedNetProfit,
                sub: `เทียบปีนี้ ${forecast.yoyChange >= 0 ? "+" : ""}${forecast.yoyChange}%`,
                icon: forecast.forecastedNetProfit >= 0 ? TrendingUp : TrendingDown,
                iconBg: forecast.forecastedNetProfit >= 0 ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" : "bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400",
                valCls: forecast.forecastedNetProfit >= 0 ? "text-amber-700 dark:text-amber-400" : "text-red-600 dark:text-red-400",
                accentClass: forecast.forecastedNetProfit >= 0 ? "amber" : "red",
              },
            ].map(s => (
              <div key={s.label} className={cn("stat-card", s.accentClass)}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-medium text-gray-400">{s.label}</p>
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.iconBg)}>
                    <s.icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className={cn("text-[22px] font-extrabold num tabular-nums leading-none", s.valCls)}>{formatBaht(s.val)}</p>
                {s.sub && <p className="text-[11px] text-gray-400 mt-1.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Year Comparison Table */}
          {(currSum || prevSum) && (
            <div className="card-premium overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">เปรียบเทียบรายปี</h3>
                <span className="ml-auto text-[11px] text-gray-400">3 ปี · ปัจจุบัน · คาดการณ์</span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th className="text-left">รายการ</th>
                      <th className="text-right">ปี {prevYear}</th>
                      <th className="text-right">ปี {currentYear}</th>
                      <th className="text-right text-amber-500">คาดการณ์ {currentYear + 1}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { lbl: "💰 รายรับ",    prev: prevSum?.totalIncome ?? 0,  curr: currSum?.totalIncome ?? 0,  fore: forecast.forecastedIncome,    pos: true  },
                      { lbl: "💸 รายจ่าย",   prev: prevSum?.totalExpense ?? 0, curr: currSum?.totalExpense ?? 0, fore: forecast.forecastedExpense,   pos: false },
                      { lbl: "🏆 กำไรสุทธิ", prev: prevSum?.netProfit ?? 0,    curr: currSum?.netProfit ?? 0,    fore: forecast.forecastedNetProfit, pos: forecast.forecastedNetProfit >= 0 },
                    ].map(row => (
                      <tr key={row.lbl}>
                        <td className="font-semibold text-gray-700 dark:text-gray-300">{row.lbl}</td>
                        <td className="text-right num tabular-nums text-gray-400 text-[12px]">{formatBaht(row.prev)}</td>
                        <td className="text-right num tabular-nums font-semibold text-gray-800 dark:text-gray-200">{formatBaht(row.curr)}</td>
                        <td className={cn("text-right num tabular-nums font-bold", row.pos ? "text-amber-600 dark:text-amber-400" : "text-red-500 dark:text-red-400")}>{formatBaht(row.fore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="card-premium p-6">
            <div className="section-header mb-5">
              <div className="section-header-icon bg-purple-50 dark:bg-purple-950/40">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">ข้อแนะนำสำหรับฤดูกาลหน้า</h2>
            </div>
            <div className="space-y-2.5">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-5 h-5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              📊 อ้างอิง: แนวโน้มเฉลี่ย 3 ปี · เงินเฟ้อปัจจัยการผลิต {forecast.inputCostInflation}%/ปี · อุปสงค์ตลาดส่งออก
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Monthly Trend Chart ── */}
      {chartData.length > 0 && (
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">แนวโน้มรายเดือน ปี {currentYear}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">รายรับ · รายจ่าย · กำไร</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              {[{ label: "รายรับ", color: "#16a34a" }, { label: "รายจ่าย", color: "#f87171" }, { label: "กำไร", color: "#fbbf24" }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="currentColor" className="opacity-[0.04]" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => (v/1000).toFixed(0) + "K"} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="รายรับ"  stroke="#16a34a" strokeWidth={2} dot={{ r: 2.5, fill: "#16a34a", strokeWidth: 2, stroke: "#fff" }} />
              <Line type="monotone" dataKey="รายจ่าย" stroke="#f87171" strokeWidth={2} dot={{ r: 2.5, fill: "#f87171", strokeWidth: 2, stroke: "#fff" }} />
              <Line type="monotone" dataKey="กำไร"    stroke="#fbbf24" strokeWidth={2} dot={{ r: 2.5, fill: "#fbbf24", strokeWidth: 2, stroke: "#fff" }} strokeDasharray="5 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
