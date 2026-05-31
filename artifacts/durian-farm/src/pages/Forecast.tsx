import { useGetForecast, useGetMonthlyTrend, useGetDashboardSummary } from "@workspace/api-client-react";
import { getGetForecastQueryKey, getGetMonthlyTrendQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { formatBaht, MONTHS_TH } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">พยากรณ์ฤดูกาลหน้า</h1>
        <p className="text-sm text-muted-foreground mt-0.5">คาดการณ์จากแนวโน้ม 3 ปีย้อนหลังและราคาตลาดส่งออก</p>
      </div>

      {forecast?.currentSeasonStage && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm">
          <span className="font-semibold text-primary">ช่วงฤดูกาลปัจจุบัน:</span>{" "}
          <span className="text-foreground">{forecast.currentSeasonStage}</span>
        </div>
      )}

      {fLoading ? (
        <div className="grid md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-card border border-border rounded-lg h-24 animate-pulse" />)}
        </div>
      ) : forecast ? (
        <>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: "รายรับที่คาดการณ์",   val: forecast.forecastedIncome,    sub: `ฤดูกาล ${currentYear + 1}`,                accent: true  },
              { label: "รายจ่ายที่คาดการณ์",  val: forecast.forecastedExpense,   sub: `เงินเฟ้อปัจจัยการผลิต ${forecast.inputCostInflation}%`, danger: true  },
              { label: "กำไรสุทธิที่คาดการณ์", val: forecast.forecastedNetProfit, sub: `เทียบปีนี้ ${forecast.yoyChange >= 0 ? "+" : ""}${forecast.yoyChange}%`, accent: forecast.forecastedNetProfit >= 0, danger: forecast.forecastedNetProfit < 0 },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-lg p-4 shadow-xs">
                <p className="text-xs text-muted-foreground font-medium mb-1.5">{s.label}</p>
                <p className={`text-xl font-semibold tabular-nums ${s.danger ? "text-destructive" : s.accent ? "text-primary" : "text-foreground"}`}>
                  {formatBaht(s.val)}
                </p>
                {s.sub && <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>}
              </div>
            ))}
          </div>

          {(currSum || prevSum) && (
            <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">เปรียบเทียบรายปี</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">รายการ</th>
                    <th className="px-5 py-3 text-right font-medium">ปี {prevYear}</th>
                    <th className="px-5 py-3 text-right font-medium">ปี {currentYear}</th>
                    <th className="px-5 py-3 text-right font-medium text-primary">คาดการณ์ {currentYear + 1}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { lbl: "รายรับ",    prev: prevSum?.totalIncome ?? 0,  curr: currSum?.totalIncome ?? 0,  fore: forecast.forecastedIncome,    ac: true,  dg: false },
                    { lbl: "รายจ่าย",   prev: prevSum?.totalExpense ?? 0, curr: currSum?.totalExpense ?? 0, fore: forecast.forecastedExpense,   ac: false, dg: true  },
                    { lbl: "กำไรสุทธิ", prev: prevSum?.netProfit ?? 0,    curr: currSum?.netProfit ?? 0,    fore: forecast.forecastedNetProfit, ac: forecast.forecastedNetProfit >= 0, dg: forecast.forecastedNetProfit < 0 },
                  ].map(row => (
                    <tr key={row.lbl} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{row.lbl}</td>
                      <td className={`px-5 py-3 text-right tabular-nums ${row.dg ? "text-destructive" : row.ac ? "text-primary" : "text-foreground"}`}>{formatBaht(row.prev)}</td>
                      <td className={`px-5 py-3 text-right tabular-nums font-medium ${row.dg ? "text-destructive" : row.ac ? "text-primary" : "text-foreground"}`}>{formatBaht(row.curr)}</td>
                      <td className={`px-5 py-3 text-right tabular-nums font-semibold ${row.dg ? "text-destructive" : row.ac ? "text-primary" : "text-foreground"}`}>{formatBaht(row.fore)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border">ข้อแนะนำสำหรับฤดูกาลหน้า</h2>
            <div className="space-y-3">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded bg-primary/15 text-primary text-xs flex items-center justify-center font-semibold shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
              อ้างอิง: แนวโน้มเฉลี่ย 3 ปี · เงินเฟ้อปัจจัยการผลิต {forecast.inputCostInflation}%/ปี · อุปสงค์ตลาดส่งออก
            </p>
          </div>
        </>
      ) : null}

      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border">แนวโน้มรายเดือน ปี {currentYear}</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => (v / 1000).toFixed(0) + "K"} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatBaht(v)} contentStyle={{ borderRadius: "6px", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="รายรับ"  stroke="hsl(133 38% 38%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="รายจ่าย" stroke="hsl(2 55% 52%)"   strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="กำไร"    stroke="hsl(33 40% 50%)"  strokeWidth={2} dot={false} strokeDasharray="5 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
