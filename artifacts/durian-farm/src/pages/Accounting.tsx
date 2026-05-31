import { useState } from "react";
import {
  useListTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useListPlots,
} from "@workspace/api-client-react";
import {
  getListTransactionsQueryKey,
  getListPlotsQueryKey,
} from "@workspace/api-client-react";
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
    plotId: "" as string,
  });

  const queryParams = {
    type: filterType,
    year: filterYear,
    month: filterMonth,
  };

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
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
      },
    },
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
        date: form.date,
        type: form.type,
        category: form.category,
        amount: amt,
        notes: form.notes || undefined,
        plotId: form.plotId ? parseInt(form.plotId) : undefined,
      },
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">บัญชีสวน</h1>
          <p className="text-sm text-muted-foreground mt-0.5">บันทึกและติดตามรายรับ–รายจ่าย</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          {showForm ? "ยกเลิก" : "+ บันทึกรายการ"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">บันทึกรายการใหม่</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">วันที่</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">ประเภท</label>
              <select
                value={form.type}
                onChange={(e) => {
                  const t = e.target.value as "income" | "expense";
                  setForm({ ...form, type: t, category: t === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] });
                }}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              >
                <option value="expense">รายจ่าย</option>
                <option value="income">รายรับ</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">หมวดหมู่</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                placeholder="0"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">แปลง (ไม่บังคับ)</label>
              <select
                value={form.plotId}
                onChange={(e) => setForm({ ...form, plotId: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              >
                <option value="">ไม่ระบุ</option>
                {plots.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">หมายเหตุ</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                placeholder="หมายเหตุเพิ่มเติม"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={createTx.isPending} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              {createTx.isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-xs text-muted-foreground">รายรับรวม</span>
          <p className="text-lg font-bold text-emerald-700 mt-1">{formatBaht(income)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-xs text-muted-foreground">รายจ่ายรวม</span>
          <p className="text-lg font-bold text-red-600 mt-1">{formatBaht(expense)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-xs text-muted-foreground">กำไรสุทธิ</span>
          <p className={`text-lg font-bold mt-1 ${net >= 0 ? "text-primary" : "text-destructive"}`}>{formatBaht(net)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-foreground">รายการทั้งหมด</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <select
              value={filterType ?? ""}
              onChange={(e) => setFilterType((e.target.value as TxType) || undefined)}
              className="border border-border rounded-lg px-2 py-1.5 text-xs bg-background text-foreground"
            >
              <option value="">ทุกประเภท</option>
              <option value="income">รายรับ</option>
              <option value="expense">รายจ่าย</option>
            </select>
            <select
              value={filterMonth ?? ""}
              onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border border-border rounded-lg px-2 py-1.5 text-xs bg-background text-foreground"
            >
              <option value="">ทุกเดือน</option>
              {MONTHS_TH.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="border border-border rounded-lg px-2 py-1.5 text-xs bg-background text-foreground"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">กำลังโหลด...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">ยังไม่มีรายการ</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">วันที่</th>
                <th className="px-4 py-2.5 text-left">ประเภท</th>
                <th className="px-4 py-2.5 text-left">หมวดหมู่</th>
                <th className="px-4 py-2.5 text-right">จำนวนเงิน</th>
                <th className="px-4 py-2.5 text-left">หมายเหตุ</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{tx.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {tx.type === "income" ? "รายรับ" : "รายจ่าย"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{tx.category}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${tx.type === "income" ? "text-emerald-700" : "text-red-600"}`}>
                    {formatBaht(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{tx.notes ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteTx.mutate({ id: tx.id })}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
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
