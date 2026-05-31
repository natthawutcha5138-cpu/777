import { useGetDashboardSummary, useGetMonthlyTrend, useGetForecast } from "@workspace/api-client-react";
import { getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, MONTHS_TH } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "wouter";

const currentYear = new Date().getFullYear();

function StatCard({ label, value, sub, color = "text-foreground" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
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
    กำไร: t.netProfit,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดภาพรวมสวน</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ปี {currentYear}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/accounting">
            <span className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground font-medium cursor-pointer hover:opacity-90 transition-opacity">
              บันทึกรายรับ/จ่าย
            </span>
          </Link>
          <Link href="/fertilizer">
            <span className="px-3 py-1.5 text-sm rounded-lg border border-border text-foreground font-medium cursor-pointer hover:bg-muted transition-colors">
              คำนวณปุ๋ย
            </span>
          </Link>
        </div>
      </div>

      {sumLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="รายรับรวม" value={formatBaht(summary.totalIncome)} color="text-emerald-700" />
          <StatCard label="รายจ่ายรวม" value={formatBaht(summary.totalExpense)} color="text-red-600" />
          <StatCard
            label="กำไรสุทธิ"
            value={formatBaht(summary.netProfit)}
            color={summary.netProfit >= 0 ? "text-primary" : "text-destructive"}
          />
          <StatCard label="ROI" value={`${summary.roi}%`} color="text-secondary-foreground" />
          <StatCard label="จำนวนแปลง" value={`${formatNumber(summary.totalPlots)} แปลง`} />
          <StatCard label="จำนวนต้น" value={`${formatNumber(summary.totalTrees)} ต้น`} />
          <StatCard label="ต้นทุน/ไร่" value={formatBaht(summary.costPerRai)} />
          <StatCard label="รายรับ/ต้น" value={formatBaht(summary.revenuePerTree)} />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          ยังไม่มีข้อมูล — เริ่มบันทึกรายรับ/จ่ายเพื่อดูสรุปภาพรวม
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">แนวโน้มรายเดือน {currentYear}</h2>
          {trendLoading ? (
            <div className="h-52 animate-pulse bg-muted rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "K"} />
                <Tooltip
                  formatter={(v: number) => formatBaht(v)}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="รายรับ" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="รายจ่าย" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">พยากรณ์ฤดูกาลหน้า</h2>
          {forecast ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">รายรับที่คาดการณ์</span>
                  <span className="font-medium text-emerald-700">{formatBaht(forecast.forecastedIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">รายจ่ายที่คาดการณ์</span>
                  <span className="font-medium text-red-600">{formatBaht(forecast.forecastedExpense)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2 mt-1">
                  <span className="text-muted-foreground font-medium">กำไรสุทธิ</span>
                  <span className={`font-bold ${forecast.forecastedNetProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                    {formatBaht(forecast.forecastedNetProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>เทียบปีก่อน</span>
                  <span className={forecast.yoyChange >= 0 ? "text-emerald-600" : "text-red-500"}>
                    {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}%
                  </span>
                </div>
              </div>
              <div className="mt-auto pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">คำแนะนำ AI</p>
                {forecast.recommendations.slice(0, 1).map((r, i) => (
                  <p key={i} className="text-xs text-foreground leading-relaxed">{r}</p>
                ))}
              </div>
              <Link href="/forecast">
                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">ดูพยากรณ์เต็ม</span>
              </Link>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              กำลังโหลด...
            </div>
          )}
        </div>
      </div>

      {summary && summary.expenseByCategory.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">รายจ่ายตามหมวดหมู่</h3>
            <div className="space-y-2">
              {summary.expenseByCategory
                .sort((a, b) => b.total - a.total)
                .map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{cat.category}</span>
                    <span className="font-medium text-red-600">{formatBaht(cat.total)}</span>
                  </div>
                ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">รายรับตามหมวดหมู่</h3>
            <div className="space-y-2">
              {summary.incomeByCategory
                .sort((a, b) => b.total - a.total)
                .map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{cat.category}</span>
                    <span className="font-medium text-emerald-700">{formatBaht(cat.total)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
