import { useState } from "react";
import { useListTransactions, useCreateTransaction, useDeleteTransaction, useListPlots } from "@workspace/api-client-react";
import { getListTransactionsQueryKey, getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatBaht, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS_TH } from "@/lib/utils";

const currentYear = new Date().getFullYear();
type TxType = "income" | "expense" | undefined;

const inputCls = "border border-border rounded px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-full";

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">บัญชีรายรับ-รายจ่าย</h1>
          <p className="text-sm text-muted-foreground mt-0.5">บันทึกและติดตามรายการทางการเงิน</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors">
          {showForm ? "ยกเลิก" : "+ บันทึกรายการ"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border">บันทึกรายการใหม่</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "วันที่", key: "date", type: "date" },
            ].map(({ label, key, type }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputCls} required />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">ประเภท</label>
              <select value={form.type} onChange={(e) => { const t = e.target.value as "income"|"expense"; setForm({ ...form, type: t, category: (t === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0] }); }} className={inputCls}>
                <option value="expense">รายจ่าย</option>
                <option value="income">รายรับ</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">หมวดหมู่</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">จำนวนเงิน (บาท)</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} placeholder="0.00" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">แปลง</label>
              <select value={form.plotId} onChange={(e) => setForm({ ...form, plotId: e.target.value })} className={inputCls}>
                <option value="">ไม่ระบุ</option>
                {plots.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder="ไม่บังคับ" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-border rounded text-foreground hover:bg-muted transition-colors">ยกเลิก</button>
            <button type="submit" disabled={createTx.isPending} className="px-5 py-2 text-sm bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {createTx.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "รายรับรวม",  val: income,  cls: "text-primary" },
          { label: "รายจ่ายรวม", val: expense, cls: "text-destructive" },
          { label: "กำไรสุทธิ",  val: net,     cls: net >= 0 ? "text-primary" : "text-destructive" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4 shadow-xs">
            <p className="text-xs text-muted-foreground font-medium mb-1.5">{s.label}</p>
            <p className={`text-lg font-semibold tabular-nums ${s.cls}`}>{formatBaht(s.val)}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-foreground">รายการทั้งหมด</span>
          <div className="flex gap-2 ml-auto flex-wrap items-center">
            <select value={filterType ?? ""} onChange={(e) => setFilterType((e.target.value as TxType) || undefined)}
              className="border border-border rounded px-2.5 py-1.5 text-xs bg-card text-foreground focus:outline-none">
              <option value="">ทุกประเภท</option>
              <option value="income">รายรับ</option>
              <option value="expense">รายจ่าย</option>
            </select>
            <select value={filterMonth ?? ""} onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border border-border rounded px-2.5 py-1.5 text-xs bg-card text-foreground focus:outline-none">
              <option value="">ทุกเดือน</option>
              {MONTHS_TH.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="border border-border rounded px-2.5 py-1.5 text-xs bg-card text-foreground focus:outline-none">
              {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">กำลังโหลด...</div>
        ) : txs.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">ไม่มีรายการในช่วงที่เลือก</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3 text-left font-medium">วันที่</th>
                <th className="px-5 py-3 text-left font-medium">ประเภท</th>
                <th className="px-5 py-3 text-left font-medium">หมวดหมู่</th>
                <th className="px-5 py-3 text-right font-medium">จำนวนเงิน</th>
                <th className="px-5 py-3 text-left font-medium">หมายเหตุ</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {txs.map(tx => (
                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground tabular-nums">
                    {new Date(tx.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tx.type === "income" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                      {tx.type === "income" ? "รายรับ" : "รายจ่าย"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-foreground">{tx.category}</td>
                  <td className={`px-5 py-3 text-right font-semibold tabular-nums ${tx.type === "income" ? "text-primary" : "text-destructive"}`}>
                    {formatBaht(tx.amount)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground max-w-[180px] truncate">{tx.notes ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteTx.mutate({ id: tx.id })}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded hover:bg-destructive/5">
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
