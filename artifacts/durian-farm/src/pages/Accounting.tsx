import { useState } from "react";
import { useListTransactions, useCreateTransaction, useDeleteTransaction, useListPlots } from "@workspace/api-client-react";
import { getListTransactionsQueryKey, getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatBaht, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS_TH } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, ChevronDown, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
type TxType = "income" | "expense" | undefined;

export default function Accounting() {
  const qc = useQueryClient();
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
      },
    },
  });
  const deleteTx = useDeleteTransaction({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() }) },
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
    <div className="max-w-6xl mx-auto space-y-5 pb-10">

      {/* ── Page Header ── */}
      <div className="relative h-28 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <img src="/images/durian-thorns-web.jpg" alt="ทุเรียน" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/75 via-gray-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-white tracking-tight">บัญชีรายรับ-รายจ่าย</h1>
              <p className="text-[11px] text-white/60 mt-0.5">บันทึกและติดตามรายการทางการเงิน</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-[13px] font-semibold rounded-xl border border-white/20 transition-all"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "ยกเลิก" : "บันทึกรายการ"}
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-3 gap-4">
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-gray-400">{s.label}</p>
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.iconBg)}>
                <s.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className={cn("text-[20px] font-extrabold num tabular-nums leading-none", s.valCls)}>{formatBaht(s.val)}</p>
          </div>
        ))}
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-premium p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">บันทึกรายการใหม่</h2>
          </div>

          {/* Type tabs */}
          <div className="flex gap-2 mb-5 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl w-fit">
            {[{ val: "expense", label: "💸 รายจ่าย" }, { val: "income", label: "💰 รายรับ" }].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => { const t = opt.val as "income"|"expense"; setForm({ ...form, type: t, category: (t === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0]! }); }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150",
                  form.type === opt.val
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                )}
              >{opt.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "วันที่", key: "date", type: "date" },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="input-base" required />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมวดหมู่</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-base">
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">จำนวนเงิน (บาท)</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-base" placeholder="0.00" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">แปลง</label>
              <select value={form.plotId} onChange={(e) => setForm({ ...form, plotId: e.target.value })} className="input-base">
                <option value="">ไม่ระบุ</option>
                {plots.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-base" placeholder="ไม่บังคับ" />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-[13px]">ยกเลิก</button>
            <button type="submit" disabled={createTx.isPending} className="btn-primary text-[13px] disabled:opacity-50">
              {createTx.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      {/* ── Transaction Table ── */}
      <div className="card-premium overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800/60 flex flex-wrap items-center gap-3">
          <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">รายการทั้งหมด</span>
          <span className="badge badge-gray">{txs.length} รายการ</span>

          {/* Type filter */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1">
            {[
              { val: undefined, label: "ทั้งหมด" },
              { val: "income"  as TxType, label: "รายรับ" },
              { val: "expense" as TxType, label: "รายจ่าย" },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => setFilterType(opt.val)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-150",
                  filterType === opt.val
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >{opt.label}</button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto flex-wrap items-center">
            <div className="relative">
              <select
                value={filterMonth ?? ""}
                onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-7 py-1.5 text-[12px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300/40 cursor-pointer"
              >
                <option value="">ทุกเดือน</option>
                {MONTHS_TH.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-7 py-1.5 text-[12px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300/40 cursor-pointer"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
          </div>
        ) : txs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-[13px] font-medium text-gray-400">ไม่มีรายการในช่วงที่เลือก</p>
            <button onClick={() => setShowForm(true)} className="mt-3 btn-primary text-[12px] py-1.5 mx-auto">
              <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="w-28">วันที่</th>
                  <th>ประเภท</th>
                  <th>หมวดหมู่</th>
                  <th className="text-right">จำนวนเงิน</th>
                  <th>หมายเหตุ</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {txs.map(tx => (
                  <tr key={tx.id}>
                    <td className="text-gray-400 text-[11px] num tabular-nums">
                      {new Date(tx.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                    <td>
                      <span className={cn("badge",
                        tx.type === "income" ? "badge-green" : "badge-red"
                      )}>
                        {tx.type === "income" ? "รายรับ" : "รายจ่าย"}
                      </span>
                    </td>
                    <td className="font-medium text-gray-700 dark:text-gray-300 text-[13px]">{tx.category}</td>
                    <td className={cn("text-right font-semibold num tabular-nums text-[13px]", tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                      {tx.type === "income" ? "+" : "−"}{formatBaht(tx.amount)}
                    </td>
                    <td className="text-gray-400 max-w-[160px] truncate text-[12px]">{tx.notes ?? "—"}</td>
                    <td className="text-right pr-4">
                      <button
                        onClick={() => deleteTx.mutate({ id: tx.id })}
                        className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
