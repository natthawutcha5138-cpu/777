import { useGetForecast, useGetMonthlyTrend, useGetDashboardSummary } from "@workspace/api-client-react";
import { getGetForecastQueryKey, getGetMonthlyTrendQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { formatBaht, MONTHS_TH } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

const currentYear = new Date().getFullYear();
const prevYear = currentYear - 1;

export default function Forecast() {
  const { data: forecast, isLoading: fLoading } = useGetForecast({ query: { queryKey: getGetForecastQueryKey() } });
  const { data: trend } = useGetMonthlyTrend(
    { year: currentYear },
    { query: { queryKey: getGetMonthlyTrendQueryKey({ year: currentYear }) } }
  );
  const { data: prevSummary } = useGetDashboardSummary(
    { year: prevYear },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ year: prevYear }) } }
  );
  const { data: currSummary } = useGetDashboardSummary(
    { year: currentYear },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ year: currentYear }) } }
  );

  const chartData = trend?.map((t) => ({
    month: MONTHS_TH[t.month - 1],
    รายรับ: t.income,
    รายจ่าย: t.expense,
    กำไร: t.netProfit,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">พยากรณ์ฤดูกาลหน้า</h1>
        <p className="text-sm text-muted-foreground mt-0.5">การคาดการณ์โดย AI จากแนวโน้ม 3 ปีและสภาพตลาดส่งออก</p>
      </div>

      {forecast?.currentSeasonStage && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm">
          <span className="text-primary font-semibold">ช่วงฤดูกาลปัจจุบัน:</span>{" "}
          <span className="text-foreground">{forecast.currentSeasonStage}</span>
        </div>
      )}

      {fLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : forecast ? (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <span className="text-xs text-muted-foreground">รายรับที่คาดการณ์</span>
              <p className="text-2xl font-bold text-emerald-700 mt-2">{formatBaht(forecast.forecastedIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">ฤดูกาล {currentYear + 1}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <span className="text-xs text-muted-foreground">รายจ่ายที่คาดการณ์</span>
              <p className="text-2xl font-bold text-red-600 mt-2">{formatBaht(forecast.forecastedExpense)}</p>
              <p className="text-xs text-muted-foreground mt-1">รวมเงินเฟ้อปุ๋ย/แรงงาน {forecast.inputCostInflation}%</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <span className="text-xs text-muted-foreground">กำไรสุทธิที่คาดการณ์</span>
              <p className={`text-2xl font-bold mt-2 ${forecast.forecastedNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                {formatBaht(forecast.forecastedNetProfit)}
              </p>
              <p className="text-xs mt-1">
                <span className={forecast.yoyChange >= 0 ? "text-emerald-600" : "text-red-500"}>
                  {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}%
                </span>{" "}
                <span className="text-muted-foreground">เทียบปีก่อน</span>
              </p>
            </div>
          </div>

          {(currSummary || prevSummary) && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">เปรียบเทียบปี</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="text-left pb-2">รายการ</th>
                      <th className="text-right pb-2">ปี {prevYear}</th>
                      <th className="text-right pb-2">ปี {currentYear}</th>
                      <th className="text-right pb-2">คาดการณ์ {currentYear + 1}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 text-muted-foreground">รายรับ</td>
                      <td className="py-2 text-right text-emerald-700 font-medium">{formatBaht(prevSummary?.totalIncome ?? 0)}</td>
                      <td className="py-2 text-right text-emerald-700 font-medium">{formatBaht(currSummary?.totalIncome ?? 0)}</td>
                      <td className="py-2 text-right text-emerald-700 font-bold">{formatBaht(forecast.forecastedIncome)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">รายจ่าย</td>
                      <td className="py-2 text-right text-red-600 font-medium">{formatBaht(prevSummary?.totalExpense ?? 0)}</td>
                      <td className="py-2 text-right text-red-600 font-medium">{formatBaht(currSummary?.totalExpense ?? 0)}</td>
                      <td className="py-2 text-right text-red-600 font-bold">{formatBaht(forecast.forecastedExpense)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-foreground">กำไรสุทธิ</td>
                      <td className={`py-2 text-right font-bold ${(prevSummary?.netProfit ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                        {formatBaht(prevSummary?.netProfit ?? 0)}
                      </td>
                      <td className={`py-2 text-right font-bold ${(currSummary?.netProfit ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                        {formatBaht(currSummary?.netProfit ?? 0)}
                      </td>
                      <td className={`py-2 text-right font-bold ${forecast.forecastedNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                        {formatBaht(forecast.forecastedNetProfit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">คำแนะนำ AI สำหรับฤดูกาลหน้า</h2>
            <div className="space-y-3">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground pt-1">
              การคาดการณ์อิงจากแนวโน้มเฉลี่ย 3 ปี | เงินเฟ้อปัจจัยการผลิต {forecast.inputCostInflation}%/ปี | อุปสงค์ส่งออกจีน
            </div>
          </div>
        </>
      ) : null}

      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">แนวโน้มรายเดือนปี {currentYear}</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "K"} />
              <Tooltip formatter={(v: number) => formatBaht(v)} labelStyle={{ fontWeight: 600 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="รายรับ" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="รายจ่าย" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="กำไร" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
