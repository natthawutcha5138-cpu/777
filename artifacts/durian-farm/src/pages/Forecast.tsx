import { useGetForecast, useGetMonthlyTrend, useGetDashboardSummary } from "@workspace/api-client-react";
import { getGetForecastQueryKey, getGetMonthlyTrendQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { formatBaht, MONTHS_TH } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

const currentYear = new Date().getFullYear();
const prevYear = currentYear - 1;

export default function Forecast() {
  const { data: forecast, isLoading: fLoading } = useGetForecast({ query: { queryKey: getGetForecastQueryKey() } });
  const { data: trend } = useGetMonthlyTrend({ year: currentYear }, { query: { queryKey: getGetMonthlyTrendQueryKey({ year: currentYear }) } });
  const { data: prevSummary } = useGetDashboardSummary({ year: prevYear }, { query: { queryKey: getGetDashboardSummaryQueryKey({ year: prevYear }) } });
  const { data: currSummary } = useGetDashboardSummary({ year: currentYear }, { query: { queryKey: getGetDashboardSummaryQueryKey({ year: currentYear }) } });

  const chartData = trend?.map((t) => ({
    month: MONTHS_TH[t.month - 1], รายรับ: t.income, รายจ่าย: t.expense, กำไร: t.netProfit,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📈 พยากรณ์ฤดูกาลหน้า</h1>
        <p className="text-sm text-muted-foreground mt-0.5">การคาดการณ์โดย AI จากแนวโน้ม 3 ปีและสภาพตลาดส่งออก</p>
      </div>

      {forecast?.currentSeasonStage && (
        <div className="bg-gradient-to-r from-primary/10 to-teal-50 border border-primary/20 rounded-2xl px-5 py-3.5 text-sm shadow-sm">
          <span className="text-primary font-semibold">🌱 ช่วงฤดูกาลปัจจุบัน:</span>{" "}
          <span className="text-foreground">{forecast.currentSeasonStage}</span>
        </div>
      )}

      {fLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white/60 border border-border/40 rounded-2xl p-5 h-28 animate-pulse" />)}
        </div>
      ) : forecast ? (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "รายรับที่คาดการณ์", value: formatBaht(forecast.forecastedIncome), icon: "💚", sub: `ฤดูกาล ${currentYear + 1}`, bg: "from-emerald-50 to-teal-50", border: "border-emerald-200/50", color: "text-emerald-600" },
              { label: "รายจ่ายที่คาดการณ์", value: formatBaht(forecast.forecastedExpense), icon: "🌸", sub: `เงินเฟ้อ ${forecast.inputCostInflation}%/ปี`, bg: "from-rose-50 to-pink-50", border: "border-rose-200/50", color: "text-rose-500" },
              { label: "กำไรสุทธิที่คาดการณ์", value: formatBaht(forecast.forecastedNetProfit), icon: "✨", sub: `${forecast.yoyChange >= 0 ? "▲" : "▼"} ${Math.abs(forecast.yoyChange)}% จากปีก่อน`, bg: "from-violet-50 to-purple-50", border: "border-violet-200/50", color: forecast.forecastedNetProfit >= 0 ? "text-violet-600" : "text-rose-500" },
            ].map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {(currSummary || prevSummary) && (
            <div className="bg-white/85 border border-border/50 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground mb-4">📊 เปรียบเทียบรายปี</h2>
              <div className="overflow-x-auto rounded-xl border border-border/40">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground bg-muted/20">
                    <tr>
                      <th className="text-left px-4 py-3">รายการ</th>
                      <th className="text-right px-4 py-3">ปี {prevYear}</th>
                      <th className="text-right px-4 py-3">ปี {currentYear}</th>
                      <th className="text-right px-4 py-3 text-violet-600">คาดการณ์ {currentYear + 1}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[
                      { label: "รายรับ", prev: prevSummary?.totalIncome ?? 0, curr: currSummary?.totalIncome ?? 0, fore: forecast.forecastedIncome, color: "text-emerald-600" },
                      { label: "รายจ่าย", prev: prevSummary?.totalExpense ?? 0, curr: currSummary?.totalExpense ?? 0, fore: forecast.forecastedExpense, color: "text-rose-500" },
                      { label: "กำไรสุทธิ", prev: prevSummary?.netProfit ?? 0, curr: currSummary?.netProfit ?? 0, fore: forecast.forecastedNetProfit, color: "text-violet-600", bold: true },
                    ].map((row) => (
                      <tr key={row.label} className="hover:bg-muted/20 transition-colors">
                        <td className={`px-4 py-3 ${row.bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                        <td className={`px-4 py-3 text-right ${row.color} ${row.bold ? "font-bold" : "font-medium"}`}>{formatBaht(row.prev)}</td>
                        <td className={`px-4 py-3 text-right ${row.color} ${row.bold ? "font-bold" : "font-medium"}`}>{formatBaht(row.curr)}</td>
                        <td className={`px-4 py-3 text-right ${row.color} font-bold`}>{formatBaht(row.fore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">💡 คำแนะนำ AI สำหรับฤดูกาลหน้า</h2>
            <div className="space-y-3">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 p-3.5 bg-white/70 border border-violet-200/40 rounded-xl shadow-sm">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-sm">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-violet-200/40">
              📌 คาดการณ์จากแนวโน้มเฉลี่ย 3 ปี | เงินเฟ้อปัจจัยการผลิต {forecast.inputCostInflation}%/ปี | อุปสงค์ตลาดส่งออกจีน
            </p>
          </div>
        </>
      ) : null}

      {chartData.length > 0 && (
        <div className="bg-white/85 border border-border/50 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">📊 แนวโน้มรายเดือนปี {currentYear}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => (v / 1000).toFixed(0) + "K"} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatBaht(v)} labelStyle={{ fontWeight: 600 }} contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="รายรับ" stroke="hsl(145 42% 55%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(145 42% 55%)" }} />
              <Line type="monotone" dataKey="รายจ่าย" stroke="hsl(355 65% 65%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(355 65% 65%)" }} />
              <Line type="monotone" dataKey="กำไร" stroke="hsl(270 40% 65%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(270 40% 65%)" }} strokeDasharray="6 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
