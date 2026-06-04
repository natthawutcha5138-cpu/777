import { useLocation } from "wouter";
import {
  useGetDashboardSummary, useGetMonthlyTrend, useGetForecast, useListTransactions,
  getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey, getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { formatBaht, formatNumber, MONTHS_TH } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import WeatherWidget from "@/components/WeatherWidget";
import {
  ArrowRight, TrendingUp, PlusCircle, MinusCircle, Map, Activity,
  Plus, TreePine, ChevronRight,
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

  const recentTxs = [...allTxs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const chartData = trend?.map((t) => ({
    month: MONTHS_TH[t.month - 1],
    รายรับ: t.income,
    รายจ่าย: t.expense,
  })) ?? [];

  const netProfit = summary?.netProfit ?? 0;
  const isProfit = netProfit >= 0;

  return (
    <div className="space-y-6 pb-20 relative">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground text-lg">ภาพรวมสวน ปี {currentYear}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4" /> การกระทำด่วน
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/accounting")}
            className="flex items-center p-4 bg-card rounded-xl border-2 border-transparent hover:border-primary hover:-translate-y-0.5 transition-all group text-left shadow-xs cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">บันทึกรายรับ</p>
              <p className="text-xs text-muted-foreground">เพิ่มรายการขายทุเรียน</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
          </button>

          <button
            onClick={() => navigate("/accounting")}
            className="flex items-center p-4 bg-card rounded-xl border-2 border-transparent hover:border-destructive hover:-translate-y-0.5 transition-all group text-left shadow-xs cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-destructive/10 flex items-center justify-center mr-3 group-hover:bg-destructive group-hover:text-white transition-colors text-destructive shrink-0">
              <MinusCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">บันทึกรายจ่าย</p>
              <p className="text-xs text-muted-foreground">ค่าปุ๋ย ค่ายา ค่าแรง</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive shrink-0" />
          </button>

          <button
            onClick={() => navigate("/plots")}
            className="flex items-center p-4 bg-card rounded-xl border-2 border-transparent hover:border-blue-500 hover:-translate-y-0.5 transition-all group text-left shadow-xs cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-600 shrink-0">
              <Map className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">จัดการแปลง</p>
              <p className="text-xs text-muted-foreground">ดูข้อมูลรายแปลง</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 shrink-0" />
          </button>
        </div>
      </section>

      {/* Financial Stats + Orchard Info */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Financial Stats — 2/3 width */}
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">ภาพรวมการเงิน (ปีนี้)</h2>

          {sumLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-card rounded-xl h-24 animate-pulse" />)}
            </div>
          ) : summary ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Net Profit — dominant card */}
              <button
                onClick={() => navigate("/accounting")}
                className="col-span-2 sm:col-span-1 bg-card p-5 rounded-2xl border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group relative text-left"
              >
                <div className="absolute top-4 right-4 bg-muted/50 p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">กำไรสุทธิ</p>
                <p className={`text-3xl font-bold mb-2 ${isProfit ? "text-primary" : "text-destructive"}`}>
                  {formatBaht(netProfit)}
                </p>
                <div className={`flex items-center gap-1 text-xs font-medium w-fit px-2 py-1 rounded ${isProfit ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  <TrendingUp className="w-3 h-3" /> ROI {summary.roi}%
                </div>
              </button>

              {/* Income */}
              <button
                onClick={() => navigate("/accounting")}
                className="bg-card p-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group relative text-left"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">รายรับรวม</p>
                <p className="text-xl font-bold text-primary">{formatBaht(summary.totalIncome)}</p>
              </button>

              {/* Expense */}
              <button
                onClick={() => navigate("/accounting")}
                className="bg-card p-4 rounded-xl border border-border hover:border-destructive/40 hover:shadow-sm transition-all cursor-pointer group relative text-left"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-1">รายจ่ายรวม</p>
                <p className="text-xl font-bold text-destructive">{formatBaht(summary.totalExpense)}</p>
              </button>

              {/* Forecast mini card */}
              {forecast && (
                <button
                  onClick={() => navigate("/forecast")}
                  className="col-span-2 bg-foreground p-4 rounded-xl text-background hover:opacity-90 hover:shadow-md transition-all cursor-pointer group relative text-left"
                >
                  <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-background" />
                  </div>
                  <p className="text-xs font-medium text-muted mb-1">ประมาณการปีหน้า</p>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="text-lg font-bold">รายรับ {formatBaht(forecast.forecastedIncome)}</span>
                    <span className="text-sm text-muted">กำไร {formatBaht(forecast.forecastedNetProfit)}</span>
                    <span className={`text-sm font-semibold ${forecast.yoyChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {forecast.yoyChange >= 0 ? "+" : ""}{forecast.yoyChange}% YoY
                    </span>
                  </div>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
              ยังไม่มีข้อมูล — เริ่มบันทึกรายรับ/จ่ายเพื่อดูสรุป
            </div>
          )}
        </section>

        {/* Orchard Info + Recent Activity — 1/3 width */}
        <section className="space-y-4">
          {/* Orchard Stats — Flat/Informational */}
          <h2 className="text-sm font-semibold text-foreground">ข้อมูลสวน</h2>
          <div className="bg-muted/30 p-5 rounded-2xl border border-border">
            {sumLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>
            ) : summary ? (
              <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                    <Map className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">จำนวนแปลง</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{summary.totalPlots} <span className="text-sm font-normal text-muted-foreground">แปลง</span></p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                    <TreePine className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">จำนวนต้น</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{formatNumber(summary.totalTrees)} <span className="text-sm font-normal text-muted-foreground">ต้น</span></p>
                </div>
                <div className="col-span-2 h-px bg-border" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">ต้นทุน / ไร่</p>
                  <p className="text-base font-bold text-foreground">{formatBaht(summary.costPerRai)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">รายรับ / ต้น</p>
                  <p className="text-base font-bold text-primary">{formatBaht(summary.revenuePerTree)}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">ยังไม่มีข้อมูลแปลง</p>
            )}
            <button
              onClick={() => navigate("/plots")}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 hover:border-primary/50 transition-all group"
            >
              ดูรายละเอียดสวน
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Recent Activity */}
          {recentTxs.length > 0 && (
            <div className="bg-card p-5 rounded-2xl border border-border shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">รายการล่าสุด</h3>
                <button onClick={() => navigate("/accounting")} className="text-xs text-primary font-medium hover:underline">ดูทั้งหมด</button>
              </div>
              <div className="space-y-2">
                {recentTxs.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => navigate("/accounting")}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                      {tx.type === "income" ? <Plus className="w-3.5 h-3.5" /> : <MinusCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.notes || tx.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${tx.type === "income" ? "text-primary" : "text-destructive"}`}>
                      {tx.type === "income" ? "+" : "−"}{formatBaht(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Monthly Chart */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">กระแสเงินสดรายเดือน ปี {currentYear}</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" />รายรับ</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />รายจ่าย</div>
          </div>
        </div>
        {trendLoading ? (
          <div className="h-52 animate-pulse bg-muted rounded" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => (v / 1000).toFixed(0) + "K"} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => formatBaht(v)}
                contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              />
              <Bar dataKey="รายรับ"  fill="hsl(133 38% 38%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="รายจ่าย" fill="hsl(2 55% 58%)"   radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">ยังไม่มีข้อมูลรายเดือน</div>
        )}
      </div>

      {/* Category Breakdown */}
      {summary && (summary.expenseByCategory.length > 0 || summary.incomeByCategory.length > 0) && (
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: "รายจ่ายตามหมวดหมู่", data: summary.expenseByCategory, isExpense: true },
            { title: "รายรับตามหมวดหมู่",  data: summary.incomeByCategory,  isExpense: false },
          ].map(({ title, data, isExpense }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-3 pb-2.5 border-b border-border">{title}</h3>
              <div className="space-y-2.5">
                {[...data].sort((a, b) => b.total - a.total).map((cat) => {
                  const max = Math.max(...data.map(c => c.total));
                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{cat.category}</span>
                        <span className={`font-medium tabular-nums ${isExpense ? "text-destructive" : "text-primary"}`}>
                          {formatBaht(cat.total)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isExpense ? "bg-destructive/50" : "bg-primary/60"}`}
                          style={{ width: `${(cat.total / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/accounting")}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 z-40 group"
        title="บันทึกรายการ"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}
