import { useGetDashboardSummary, useGetMonthlyTrend, useGetForecast } from "@workspace/api-client-react";
import { getGetDashboardSummaryQueryKey, getGetMonthlyTrendQueryKey, getGetForecastQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, MONTHS_TH } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "wouter";
import WeatherWidget from "@/components/WeatherWidget";

const currentYear = new Date().getFullYear();

const statCards = [
  { key: "totalIncome",   label: "รายรับรวม",     icon: "💚", bg: "from-emerald-50 to-teal-50",     border: "border-emerald-200/60",  val: (s: any) => s.totalIncome,   color: "text-emerald-600" },
  { key: "totalExpense",  label: "รายจ่ายรวม",    icon: "🌸", bg: "from-rose-50 to-pink-50",         border: "border-rose-200/60",     val: (s: any) => s.totalExpense,  color: "text-rose-500" },
  { key: "netProfit",     label: "กำไรสุทธิ",      icon: "✨", bg: "from-violet-50 to-purple-50",    border: "border-violet-200/60",   val: (s: any) => s.netProfit,     color: "text-violet-600" },
  { key: "roi",           label: "ROI",             icon: "📊", bg: "from-amber-50 to-yellow-50",     border: "border-amber-200/60",    val: (s: any) => `${s.roi}%`,    color: "text-amber-600", raw: true },
  { key: "totalPlots",    label: "จำนวนแปลง",      icon: "🗺️", bg: "from-sky-50 to-blue-50",         border: "border-sky-200/60",      val: (s: any) => `${s.totalPlots} แปลง`, color: "text-sky-600", raw: true },
  { key: "totalTrees",    label: "จำนวนต้น",       icon: "🌳", bg: "from-green-50 to-lime-50",        border: "border-green-200/60",    val: (s: any) => `${formatNumber(s.totalTrees)} ต้น`, color: "text-green-600", raw: true },
  { key: "costPerRai",    label: "ต้นทุน/ไร่",     icon: "🧮", bg: "from-orange-50 to-amber-50",     border: "border-orange-200/60",   val: (s: any) => s.costPerRai,   color: "text-orange-500" },
  { key: "revenuePerTree",label: "รายรับ/ต้น",     icon: "💰", bg: "from-teal-50 to-cyan-50",        border: "border-teal-200/60",     val: (s: any) => s.revenuePerTree, color: "text-teal-600" },
];

function PulseCard() {
  return <div className="rounded-2xl border border-border/50 bg-white/60 p-4 h-24 animate-pulse" />;
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">แดชบอร์ดภาพรวมสวน</h1>
          <p className="text-sm text-muted-foreground mt-1">สรุปข้อมูลฤดูกาลปี {currentYear}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/accounting">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground font-medium cursor-pointer hover:opacity-90 transition-all shadow-sm">
              + บันทึกรายการ
            </span>
          </Link>
          <Link href="/fertilizer">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-white border border-border/60 text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-all shadow-sm">
              ⚗️ คำนวณปุ๋ย
            </span>
          </Link>
        </div>
      </div>

      {sumLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <PulseCard key={i} />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((card) => (
            <div key={card.key} className={`rounded-2xl border ${card.border} bg-gradient-to-br ${card.bg} p-4 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
                <span className="text-base">{card.icon}</span>
              </div>
              <p className={`text-xl font-bold ${card.color}`}>
                {card.raw ? String(card.val(summary)) : formatBaht(card.val(summary) as number)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/70 border border-border/50 rounded-2xl p-10 text-center text-muted-foreground shadow-sm">
          ยังไม่มีข้อมูล — เริ่มบันทึกรายรับ/จ่ายเพื่อดูสรุปภาพรวม
        </div>
      )}

      <WeatherWidget />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white/80 border border-border/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">📊 แนวโน้มรายเดือน {currentYear}</h2>
          </div>
          {trendLoading ? (
            <div className="h-52 animate-pulse bg-muted/40 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => (v / 1000).toFixed(0) + "K"} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => formatBaht(v)}
                  labelStyle={{ fontWeight: 600 }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "var(--shadow-md)" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="รายรับ" fill="hsl(145 42% 62%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="รายจ่าย" fill="hsl(355 65% 70%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span>🔮</span>
            <h2 className="text-sm font-semibold text-foreground">พยากรณ์ฤดูกาลหน้า</h2>
          </div>
          {forecast ? (
            <>
              <div className="space-y-2.5">
                {[
                  { label: "รายรับที่คาดการณ์", value: forecast.forecastedIncome, color: "text-emerald-600" },
                  { label: "รายจ่ายที่คาดการณ์", value: forecast.forecastedExpense, color: "text-rose-500" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={`font-semibold ${row.color}`}>{formatBaht(row.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm border-t border-violet-200/60 pt-2.5">
                  <span className="font-medium text-foreground">กำไรสุทธิ</span>
                  <span className={`font-bold text-base ${forecast.forecastedNetProfit >= 0 ? "text-violet-600" : "text-rose-500"}`}>
                    {formatBaht(forecast.forecastedNetProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">เทียบปีก่อน</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${forecast.yoyChange >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"}`}>
                    {forecast.yoyChange >= 0 ? "▲" : "▼"} {Math.abs(forecast.yoyChange)}%
                  </span>
                </div>
              </div>
              <div className="mt-auto pt-3 border-t border-violet-200/60">
                <p className="text-xs font-semibold text-violet-700 mb-1.5">💡 คำแนะนำ AI</p>
                <p className="text-xs text-foreground leading-relaxed line-clamp-3">{forecast.recommendations[0]}</p>
              </div>
              <Link href="/forecast">
                <span className="text-xs text-violet-600 font-medium cursor-pointer hover:underline">ดูพยากรณ์เต็ม →</span>
              </Link>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">กำลังโหลด...</div>
          )}
        </div>
      </div>

      {summary && (summary.expenseByCategory.length > 0 || summary.incomeByCategory.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/80 border border-border/50 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3">🌸 รายจ่ายตามหมวดหมู่</h3>
            <div className="space-y-2.5">
              {summary.expenseByCategory.sort((a, b) => b.total - a.total).map((cat, i) => {
                const maxVal = Math.max(...summary.expenseByCategory.map(c => c.total));
                const pct = Math.round((cat.total / maxVal) * 100);
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{cat.category}</span>
                      <span className="font-semibold text-rose-500">{formatBaht(cat.total)}</span>
                    </div>
                    <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white/80 border border-border/50 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-3">💚 รายรับตามหมวดหมู่</h3>
            <div className="space-y-2.5">
              {summary.incomeByCategory.sort((a, b) => b.total - a.total).map((cat) => {
                const maxVal = Math.max(...summary.incomeByCategory.map(c => c.total));
                const pct = Math.round((cat.total / maxVal) * 100);
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{cat.category}</span>
                      <span className="font-semibold text-emerald-600">{formatBaht(cat.total)}</span>
                    </div>
                    <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
