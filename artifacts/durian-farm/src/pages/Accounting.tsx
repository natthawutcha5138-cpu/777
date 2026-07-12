import { useState } from "react";
import { useListTransactions, useCreateTransaction, useDeleteTransaction, useListPlots } from "@workspace/api-client-react";
import { getListTransactionsQueryKey, getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatBaht, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS_TH } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, ChevronDown, X, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const currentYear = new Date().getFullYear();
type TxType = "income" | "expense" | undefined;

export default function Accounting() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [filterType,  setFilterType]  = useState<TxType>(undefined);
  const [filterYear,  setFilterYear]  = useState<number>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
  const [showForm,    setShowForm]    = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "income" | "expense",
    category: EXPENSE_CATEGORIES[0]!,
    amount: "", notes: "", plotId: "",
  });

  const qp = { type: filterType, year: filterYear, month: filterMonth };
  const { data: txs = [], isLoading } = useListTransactions(qp, { query: { queryKey: getListTransactionsQueryKey(qp) } });
  const { data: plots = [] } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });

  const createTx = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        setShowForm(false);
        setForm({ date: new Date().toISOString().split("T")[0], type: "expense", category: EXPENSE_CATEGORIES[0]!, amount: "", notes: "", plotId: "" });
        toast({ title: "บันทึกรายการสำเร็จ", description: "ระบบได้เพิ่มรายการบัญชีเรียบร้อยแล้ว" });
      },
      onError: () => {
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกรายการได้ โปรดลองอีกครั้ง", variant: "destructive" });
      }
    },
  });
  
  const deleteTx = useDeleteTransaction({
    mutation: { 
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        toast({ title: "ลบรายการสำเร็จ", description: "รายการถูกลบออกจากระบบแล้ว" });
      },
      onError: () => {
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถลบรายการได้ โปรดลองอีกครั้ง", variant: "destructive" });
      }
    },
  });

  const income  = txs.filter(t => t.type === "income" ).reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const cats = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || isNaN(amt)) return;
    createTx.mutate({ data: { date: form.date, type: form.type, category: form.category, amount: amt, notes: form.notes || undefined, plotId: form.plotId ? parseInt(form.plotId) : undefined } });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 page-enter stagger">

      {/* ── Page Header ── */}
      <div className="relative h-32 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <img src="/images/durian-thorns-web.jpg" alt="ทุเรียน" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">บัญชีรายรับ-รายจ่าย</h1>
              <p className="text-sm text-white/70 mt-1">บันทึกและวิเคราะห์ต้นทุนการทำสวนทุเรียน</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold rounded-xl transition-all shadow-sm focus-ring"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "ยกเลิก" : "บันทึกรายการ"}
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {[
          {
            label: "รายรับรวม", val: income, icon: ArrowUpRight,
            iconBg: "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400",
            valCls: "text-green-700 dark:text-green-400", accentClass: "green",
          },
          {
            label: "รายจ่ายรวม", val: expense, icon: ArrowDownRight,
            iconBg: "bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400",
            valCls: "text-red-600 dark:text-red-400", accentClass: "red",
          },
          {
            label: "กำไรสุทธิ", val: net,
            icon: net >= 0 ? TrendingUp : TrendingDown,
            iconBg: net >= 0 ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" : "bg-red-100 dark:bg-red-950/40 text-red-500 dark:text-red-400",
            valCls: net >= 0 ? "text-amber-700 dark:text-amber-400" : "text-red-600 dark:text-red-400",
            accentClass: net >= 0 ? "amber" : "red",
          },
        ].map(s => (
          <div key={s.label} className={cn("stat-card", s.accentClass)}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.iconBg)}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className={cn("text-3xl font-extrabold num tabular-nums leading-none", s.valCls)}>{formatBaht(s.val)}</p>
          </div>
        ))}
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-premium p-6 sm:p-8 fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
              <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">บันทึกรายการใหม่</h2>
          </div>

          {/* Type tabs */}
          <div className="flex gap-2 mb-6 p-1.5 bg-gray-100/80 dark:bg-gray-800/60 rounded-xl w-fit">
            {[{ val: "expense", label: "💸 รายจ่าย" }, { val: "income", label: "💰 รายรับ" }].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => { const t = opt.val as "income"|"expense"; setForm({ ...form, type: t, category: (t === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0]! }); }}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 focus-ring",
                  form.type === opt.val
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                )}
              >{opt.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="tx-date" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">วันที่ <span className="text-red-500">*</span></label>
              <input id="tx-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-base" required />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="tx-category" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมวดหมู่ <span className="text-red-500">*</span></label>
              <select id="tx-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-base cursor-pointer">
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="tx-amount" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">จำนวนเงิน (บาท) <span className="text-red-500">*</span></label>
              <input id="tx-amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-base num tabular-nums font-medium" placeholder="0.00" required />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="tx-plot" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">แปลง</label>
              <select id="tx-plot" value={form.plotId} onChange={(e) => setForm({ ...form, plotId: e.target.value })} className="input-base cursor-pointer">
                <option value="">-- ไม่ระบุ --</option>
                {plots.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 lg:col-span-2">
              <label htmlFor="tx-notes" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมายเหตุ</label>
              <input id="tx-notes" type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-base" placeholder="ระบุรายละเอียดเพิ่มเติม (ไม่บังคับ)" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">ยกเลิก</button>
            <button type="submit" disabled={createTx.isPending} className="btn-primary text-sm min-w-[120px] justify-center">
              {createTx.isPending ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> กำลังบันทึก...</span>
              ) : (
                <span className="flex items-center gap-2"><Receipt className="w-4 h-4" /> บันทึกรายการ</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Transaction Table ── */}
      <div className="card-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 dark:text-white">รายการทั้งหมด</span>
            <span className="badge badge-gray px-2.5 py-1 text-xs">{txs.length} รายการ</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            {/* Type filter */}
            <div className="flex gap-1 bg-gray-100/80 dark:bg-gray-800/60 rounded-xl p-1 shrink-0">
              {[
                { val: undefined, label: "ทั้งหมด" },
                { val: "income"  as TxType, label: "รายรับ" },
                { val: "expense" as TxType, label: "รายจ่าย" },
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setFilterType(opt.val)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 focus-ring",
                    filterType === opt.val
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >{opt.label}</button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <select
                  aria-label="เลือกเดือน"
                  value={filterMonth ?? ""}
                  onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-3.5 pr-8 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 transition-all cursor-pointer shadow-sm"
                >
                  <option value="">ทุกเดือน</option>
                  {MONTHS_TH.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  aria-label="เลือกปี"
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-3.5 pr-8 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 transition-all cursor-pointer shadow-sm"
                >
                  {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}
          </div>
        ) : txs.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center fade-up">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">ไม่มีรายการบัญชี</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6 max-w-[250px]">ไม่พบข้อมูลรายรับ-รายจ่ายในช่วงเวลาที่คุณเลือก</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> บันทึกรายการใหม่
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base w-full">
              <thead>
                <tr>
                  <th className="w-32 whitespace-nowrap">วันที่</th>
                  <th className="w-24">ประเภท</th>
                  <th className="min-w-[120px]">หมวดหมู่</th>
                  <th className="text-right min-w-[120px]">จำนวนเงิน</th>
                  <th className="hidden sm:table-cell">หมายเหตุ</th>
                  <th className="w-14" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {txs.map((tx, idx) => (
                  <tr key={tx.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms`}}>
                    <td className="text-gray-500 dark:text-gray-400 text-xs font-medium num tabular-nums whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <span className={cn("badge px-2.5 py-1 text-[11px]",
                        tx.type === "income" ? "badge-green" : "badge-red"
                      )}>
                        {tx.type === "income" ? "รายรับ" : "รายจ่าย"}
                      </span>
                    </td>
                    <td className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{tx.category}</td>
                    <td className={cn("text-right font-bold num tabular-nums text-sm", tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                      {tx.type === "income" ? "+" : "−"}{formatBaht(tx.amount)}
                    </td>
                    <td className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[200px] hidden sm:table-cell">{tx.notes || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                    <td className="text-right pr-4">
                      <button
                        onClick={() => { if (confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) deleteTx.mutate({ id: tx.id }); }}
                        aria-label="ลบรายการ"
                        title="ลบรายการ"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all focus-ring focus:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
