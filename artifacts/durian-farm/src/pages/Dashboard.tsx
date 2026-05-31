import { useGetDashboardSummary, useGetMonthlyTrend, useGetForecast } from "@workspace/api-client-react";
import { getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, MONTHS_TH } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "wouter";
import WeatherWidget from "@/components/WeatherWidget";

const currentYear = new Date().getFullYear();

function StatCard({ label, value, sub, accent = false, danger = false }: {
  label: string; value: string; sub?: string; accent?: boolean; danger?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-xs">
      <p className="text-xs text-muted-foreground font-medium mb-1.5">{label}</p>
      <p className={`text-xl font-semibold ${danger ? "text-destructive" : accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: sumLoading } = useGetDashboardSummary(
    { year: currentYear },
    { query: { queryKey: getGetDashboardSummaryQueryKey({ year: currentYear }) } }
  );
  const { data: trend, isLoading: trendLoading } = useGetMonthlyTrend(
    { year: currentYear },
    { query: { queryKey: getGetMonthlyTrendQueryKey({ year: currentYear }) } }
  );
  const { data: forecast } = useGetForecast({ query: { queryKey: getGetForecastQueryKey() } });

  const chartData = trend?.map((t) => ({
    month: MONTHS_TH[t.month - 1],
    รายรับ: t.income,
    รายจ่าย: t.expense,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">ภาพรวมสวน ปี {currentYear}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">สรุปรายรับ-รายจ่ายและสถานะแปลง</p>
        </div>
        <div className="flex gap-2">
          <Link href="/accounting">
            <span className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded cursor-pointer hover:bg-primary/90 transition-colors">
              + บันทึกรายการ
            </span>
          </Link>
        </div>
      </div>

      {sumLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="รายรับรวม"   value={formatBaht(summary.totalIncome)}   accent />
          <StatCard label="รายจ่ายรวม"  value={formatBaht(summary.totalExpense)}  danger />
          <StatCard label="กำไรสุทธิ"   value={formatBaht(summary.netProfit)}     accent={summary.netProfit >= 0} danger={summary.netProfit < 0} />
          <StatCard label="ROI"          value={`${summary.roi}%`} />
          <StatCard label="จำนวนแปลง"   value={`${summary.totalPlots} แปลง`} />
          <StatCard label="จำนวนต้น"    value={`${formatNumber(summary.totalTrees)} ต้น`} />
          <StatCard label="ต้นทุน/ไร่"  value={formatBaht(summary.costPerRai)} />
          <StatCard label="รายรับ/ต้น"  value={formatBaht(summary.revenuePerTree)} />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
          ยังไม่มีข้อมูล — เริ่มบันทึกรายรับ/จ่ายเพื่อดูสรุป
        </div>
      )}

      <WeatherWidget />

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-card border border-border rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border">
            รายรับ-รายจ่ายรายเดือน ปี {currentYear}
          </h2>
          {trendLoading ? (
            <div className="h-52 animate-pulse bg-muted rounded" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => (v / 1000).toFixed(0) + "K"} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => formatBaht(v)}
                  contentStyle={{ borderRadius: "6px", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="รายรับ"  fill="hsl(133 38% 38%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="รายจ่าย" fill="hsl(2 55% 58%)"   radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">ยังไม่มีข้อมูลรายเดือน</div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5 shadow-xs flex flex-col">
          <h2 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border">
            แนวโน้มฤดูกาลหน้า
          </h2>
          {forecast ? (
            <div className="space-y-3 text-sm flex-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">รายรับที่คาดการณ์</span>
                <span className="font-semibold text-primary">{formatBaht(forecast.forecastedIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">รายจ่ายที่คาดการณ์</span>
                <span className="font-semibold text-destructive">{formatBaht(forecast.forecastedExpense)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium text-foreground">กำไรสุทธิ</span>
                <span className={`font-bold ${forecast.forecastedNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                  {formatBaht(forecast.forecastedNetProfit)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">เทียบกับปีนี้</span>
                <span className={forecast.yoyChange >= 0 ? "text-primary font-medium" : "text-destructive font-medium"}>
                  {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}%
                </span>
              </div>
              <div className="mt-auto pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">ข้อแนะนำ</p>
                <p className="text-xs text-foreground leading-relaxed">{forecast.recommendations[0]}</p>
              </div>
              <Link href="/forecast">
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">ดูรายละเอียดเพิ่มเติม →</span>
              </Link>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">กำลังโหลด...</div>
          )}
        </div>
      </div>

      {summary && (summary.expenseByCategory.length > 0 || summary.incomeByCategory.length > 0) && (
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: "รายจ่ายตามหมวดหมู่", data: summary.expenseByCategory, isExpense: true },
            { title: "รายรับตามหมวดหมู่",  data: summary.incomeByCategory,  isExpense: false },
          ].map(({ title, data, isExpense }) => (
            <div key={title} className="bg-card border border-border rounded-lg p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-3 pb-2.5 border-b border-border">{title}</h3>
              <div className="space-y-2">
                {data.sort((a, b) => b.total - a.total).map((cat) => {
                  const max = Math.max(...data.map(c => c.total));
                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{cat.category}</span>
                        <span className={`font-medium tabular-nums ${isExpense ? "text-destructive" : "text-primary"}`}>
                          {formatBaht(cat.total)}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isExpense ? "bg-destructive/60" : "bg-primary/60"}`}
                          style={{ width: `${(cat.total / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
