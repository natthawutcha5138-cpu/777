import { useState } from "react";
import {
  useListTransactions, useCreateTransaction, useDeleteTransaction, useListPlots,
} from "@workspace/api-client-react";
import { getListTransactionsQueryKey, getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatBaht, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS_TH } from "@/lib/utils";

const currentYear = new Date().getFullYear();
type TxType = "income" | "expense" | undefined;

export default function Accounting() {
  const qc = useQueryClient();
  const [filterType, setFilterType] = useState<TxType>(undefined);
  const [filterYear, setFilterYear] = useState<number>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "income" | "expense",
    category: "ปุ๋ย",
    amount: "",
    notes: "",
    plotId: "",
  });

  const queryParams = { type: filterType, year: filterYear, month: filterMonth };
  const { data: transactions = [], isLoading } = useListTransactions(queryParams, {
    query: { queryKey: getListTransactionsQueryKey(queryParams) },
  });
  const { data: plots = [] } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });

  const createTx = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        setShowForm(false);
        setForm({ date: new Date().toISOString().split("T")[0], type: "expense", category: "ปุ๋ย", amount: "", notes: "", plotId: "" });
      },
    },
  });
  const deleteTx = useDeleteTransaction({
    mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() }); } },
  });

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || isNaN(amt)) return;
    createTx.mutate({
      data: {
        date: form.date, type: form.type, category: form.category, amount: amt,
        notes: form.notes || undefined, plotId: form.plotId ? parseInt(form.plotId) : undefined,
      },
    });
  }

  const inputCls = "border border-border/60 rounded-xl px-3 py-2 text-sm bg-white/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">บัญชีสวน</h1>
          <p className="text-sm text-muted-foreground mt-0.5">บันทึกและติดตามรายรับ–รายจ่ายทุกรายการ</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          {showForm ? "✕ ยกเลิก" : "+ บันทึกรายการ"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/90 border border-border/50 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">📝 บันทึกรายการใหม่</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">วันที่</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">ประเภท</label>
              <select value={form.type} onChange={(e) => { const t = e.target.value as "income" | "expense"; setForm({ ...form, type: t, category: t === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] }); }} className={inputCls}>
                <option value="expense">รายจ่าย</option>
                <option value="income">รายรับ</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">หมวดหมู่</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">จำนวนเงิน (บาท)</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="0.00" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">แปลง (ไม่บังคับ)</label>
              <select value={form.plotId} onChange={(e) => setForm({ ...form, plotId: e.target.value })} className={inputCls}>
                <option value="">ไม่ระบุ</option>
                {plots.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder="หมายเหตุเพิ่มเติม" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-border/60 rounded-xl text-foreground hover:bg-muted/40 transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={createTx.isPending} className="px-5 py-2 text-sm bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm">
              {createTx.isPending ? "กำลังบันทึก..." : "✓ บันทึก"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "รายรับรวม", value: formatBaht(income), icon: "💚", bg: "from-emerald-50 to-teal-50", border: "border-emerald-200/50", color: "text-emerald-600" },
          { label: "รายจ่ายรวม", value: formatBaht(expense), icon: "🌸", bg: "from-rose-50 to-pink-50", border: "border-rose-200/50", color: "text-rose-500" },
          { label: "กำไรสุทธิ", value: formatBaht(net), icon: "✨", bg: "from-violet-50 to-purple-50", border: "border-violet-200/50", color: net >= 0 ? "text-violet-600" : "text-rose-500" },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-4 shadow-sm`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              <span className="text-base">{s.icon}</span>
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/80 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-border/40 flex flex-wrap gap-3 items-center bg-muted/20">
          <span className="text-sm font-semibold text-foreground">รายการทั้งหมด</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            {[
              { label: "ทุกประเภท", val: "" }, { label: "รายรับ", val: "income" }, { label: "รายจ่าย", val: "expense" }
            ].map(({ label, val }) => (
              <button key={val} onClick={() => setFilterType((val as TxType) || undefined)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${(filterType ?? "") === val ? "bg-primary text-primary-foreground shadow-sm" : "bg-white border border-border/60 text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
            <select value={filterMonth ?? ""} onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border border-border/60 rounded-lg px-2 py-1 text-xs bg-white text-foreground">
              <option value="">ทุกเดือน</option>
              {MONTHS_TH.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="border border-border/60 rounded-lg px-2 py-1 text-xs bg-white text-foreground">
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">กำลังโหลด...</div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-muted-foreground text-sm">ยังไม่มีรายการ</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/20">
              <tr>
                <th className="px-5 py-3 text-left">วันที่</th>
                <th className="px-5 py-3 text-left">ประเภท</th>
                <th className="px-5 py-3 text-left">หมวดหมู่</th>
                <th className="px-5 py-3 text-right">จำนวนเงิน</th>
                <th className="px-5 py-3 text-left">หมายเหตุ</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground">{tx.date}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium ${tx.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                      {tx.type === "income" ? "💚 รายรับ" : "🌸 รายจ่าย"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-foreground">{tx.category}</td>
                  <td className={`px-5 py-3 text-right font-bold ${tx.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                    {formatBaht(tx.amount)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">{tx.notes ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteTx.mutate({ id: tx.id })} className="text-xs text-muted-foreground hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50">
                      ลบ
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
