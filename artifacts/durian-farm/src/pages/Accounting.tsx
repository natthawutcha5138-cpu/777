import { useState } from "react";
import { useListTransactions, useCreateTransaction, useDeleteTransaction, useListPlots } from "@workspace/api-client-react";
import { getListTransactionsQueryKey, getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatBaht, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS_TH } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, ChevronDown } from "lucide-react";

const currentYear = new Date().getFullYear();
type TxType = "income" | "expense" | undefined;

const inputCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:bg-white transition-all w-full";

export default function Accounting() {
  const qc = useQueryClient();
  const [filterType,  setFilterType]  = useState<TxType>(undefined);
  const [filterYear,  setFilterYear]  = useState<number>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
  const [showForm,    setShowForm]    = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "income" | "expense",
    category: EXPENSE_CATEGORIES[0],
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
        setForm({ date: new Date().toISOString().split("T")[0], type: "expense", category: EXPENSE_CATEGORIES[0], amount: "", notes: "", plotId: "" });
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
    <div className="space-y-5 pb-10">

      {/* Photo Banner Header */}
      <div className="relative h-32 rounded-3xl overflow-hidden shadow-lg">
        <img src="/images/durian-thorns-web.jpg" alt="ทุเรียน" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow">บัญชีรายรับ-รายจ่าย</h1>
              <p className="text-xs text-white/70 mt-0.5">บันทึกและติดตามรายการทางการเงิน</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 max-sm:hidden">
              {["/images/durian-seasons-web.jpg", "/images/durian-flower.jpg"].map((src, i) => (
                <div key={i} className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/30 shadow">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm font-semibold rounded-2xl border border-white/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              {showForm ? "ยกเลิก" : "บันทึกรายการ"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "รายรับรวม",  val: income,  bg: "from-emerald-50 to-green-100",  icon: "💰", textCls: "text-green-700",   iconBg: "bg-green-200"  },
          { label: "รายจ่ายรวม", val: expense, bg: "from-rose-50 to-pink-100",       icon: "💸", textCls: "text-rose-600",    iconBg: "bg-pink-200"   },
          { label: "กำไรสุทธิ",  val: net,     bg: net >= 0 ? "from-amber-50 to-yellow-100" : "from-rose-50 to-pink-100",
            icon: net >= 0 ? "🏆" : "📉", textCls: net >= 0 ? "text-amber-700" : "text-rose-600", iconBg: net >= 0 ? "bg-amber-200" : "bg-pink-200" },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-3xl p-5 shadow-sm`}>
            <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
            <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
            <p className={`text-xl font-bold tabular-nums ${s.textCls}`}>{formatBaht(s.val)}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-5">บันทึกรายการใหม่</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">วันที่</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">ประเภท</label>
              <select value={form.type} onChange={(e) => { const t = e.target.value as "income"|"expense"; setForm({ ...form, type: t, category: (t === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0] }); }} className={inputCls}>
                <option value="expense">รายจ่าย</option>
                <option value="income">รายรับ</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">หมวดหมู่</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">จำนวนเงิน (บาท)</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="0.00" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">แปลง</label>
              <select value={form.plotId} onChange={(e) => setForm({ ...form, plotId: e.target.value })} className={inputCls}>
                <option value="">ไม่ระบุ</option>
                {plots.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder="ไม่บังคับ" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
            <button type="submit" disabled={createTx.isPending} className="px-6 py-2.5 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-60 shadow-md shadow-green-200">
              {createTx.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      {/* Transaction List */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-gray-800">รายการทั้งหมด</span>

          {/* Type filter tabs */}
          <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
            {[
              { val: undefined, label: "ทั้งหมด" },
              { val: "income" as TxType, label: "รายรับ" },
              { val: "expense" as TxType, label: "รายจ่าย" },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => setFilterType(opt.val)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterType === opt.val
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto flex-wrap items-center">
            <div className="relative">
              <select
                value={filterMonth ?? ""}
                onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                className="appearance-none border border-gray-200 rounded-xl pl-3 pr-7 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
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
                className="appearance-none border border-gray-200 rounded-xl pl-3 pr-7 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">กำลังโหลด...</div>
        ) : txs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm text-gray-400">ไม่มีรายการในช่วงที่เลือก</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">วันที่</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">ประเภท</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">หมวดหมู่</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">จำนวนเงิน</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">หมายเหตุ</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {txs.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-gray-500 tabular-nums text-xs">
                    {new Date(tx.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                      tx.type === "income"
                        ? "bg-green-100 text-green-700"
                        : "bg-pink-100 text-pink-700"
                    }`}>
                      {tx.type === "income" ? "💰 รายรับ" : "💸 รายจ่าย"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700 font-medium">{tx.category}</td>
                  <td className={`px-5 py-3.5 text-right font-bold tabular-nums ${tx.type === "income" ? "text-green-600" : "text-rose-500"}`}>
                    {tx.type === "income" ? "+" : "−"}{formatBaht(tx.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 max-w-[180px] truncate text-xs">{tx.notes ?? "—"}</td>
                  <td className="px-3 py-3.5 text-right">
                    <button
                      onClick={() => deleteTx.mutate({ id: tx.id })}
                      className="p-1.5 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
