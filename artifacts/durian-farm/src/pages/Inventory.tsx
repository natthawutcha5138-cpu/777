import { useState } from "react";
import { 
  useListInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, useGetInventorySummary,
  getListInventoryItemsQueryKey, getGetInventorySummaryQueryKey,
  InventoryItem, InventoryItemInput
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, PackageOpen, AlertTriangle, Pencil, Trash2, X, Archive, DollarSign } from "lucide-react";
import { cn, formatBaht } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";

const CATEGORIES = ["ปุ๋ย", "ยา/สารเคมี", "อุปกรณ์เครื่องใช้", "อะไหล่เครื่องจักร", "อื่นๆ"];
const UNITS = ["กระสอบ", "กิโลกรัม", "ลิตร", "ขวด", "กล่อง", "ชิ้น", "อัน"];

const emptyForm = (): InventoryItemInput => ({ name: "", category: CATEGORIES[0], unit: UNITS[0], quantity: 0, minQuantity: 0, costPerUnit: 0, supplier: "", notes: "" });

export default function Inventory() {
  const { user } = useAuthContext();
  const isAuthed = !!user?.id;
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useListInventoryItems({ query: { queryKey: getListInventoryItemsQueryKey(), enabled: isAuthed } });
  const { data: summary } = useGetInventorySummary({ query: { queryKey: getGetInventorySummaryQueryKey(), enabled: isAuthed } });

  const createItem = useCreateInventoryItem({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() }); qc.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() }); setShowForm(false); setForm(emptyForm()); } } });
  const updateItem = useUpdateInventoryItem({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() }); qc.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() }); setEditId(null); setForm(emptyForm()); setShowForm(false); } } });
  const deleteItem = useDeleteInventoryItem({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() }); qc.invalidateQueries({ queryKey: getGetInventorySummaryQueryKey() }); } } });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<InventoryItemInput>(emptyForm());

  function startEdit(item: InventoryItem) {
    setEditId(item.id);
    setForm({ name: item.name, category: item.category, unit: item.unit, quantity: item.quantity, minQuantity: item.minQuantity, costPerUnit: item.costPerUnit, supplier: item.supplier || "", notes: item.notes || "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, quantity: Number(form.quantity), minQuantity: Number(form.minQuantity), costPerUnit: Number(form.costPerUnit) };
    editId !== null ? updateItem.mutate({ id: editId, data }) : createItem.mutate({ data });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">คลังสินค้า (Inventory)</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">สต๊อกปุ๋ย ยา และอุปกรณ์ในฟาร์ม</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }} className="btn-primary text-[13px]">
          {showForm && !editId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm && !editId ? "ยกเลิก" : "เพิ่มสินค้า"}
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card border-l-4 border-l-blue-500">
            <p className="text-[11px] font-medium text-gray-400 mb-1">สินค้าทั้งหมด</p>
            <p className="text-[22px] font-extrabold text-gray-900 dark:text-white num">{summary.totalItems} รายการ</p>
          </div>
          <div className="stat-card border-l-4 border-l-green-500">
            <p className="text-[11px] font-medium text-gray-400 mb-1">มูลค่ารวมในคลัง</p>
            <p className="text-[22px] font-extrabold text-gray-900 dark:text-white num">{formatBaht(summary.totalValue)}</p>
          </div>
          <div className={cn("stat-card border-l-4", summary.lowStockCount > 0 ? "border-l-red-500 bg-red-50 dark:bg-red-950/20" : "border-l-gray-300")}>
            <p className="text-[11px] font-medium text-gray-400 mb-1">แจ้งเตือนของใกล้หมด</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-[22px] font-extrabold num", summary.lowStockCount > 0 ? "text-red-600" : "text-gray-900 dark:text-white")}>{summary.lowStockCount} รายการ</p>
              {summary.lowStockCount > 0 && <AlertTriangle className="w-5 h-5 text-red-500" />}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-premium p-6">
          <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-4">{editId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ชื่อสินค้า</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมวดหมู่</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-base">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หน่วยนับ</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-base">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">จำนวนคงเหลือ</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value as any })} className="input-base" min="0" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">จุดสั่งซื้อ (ชิ้นต่ำสุด)</label>
              <input type="number" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value as any })} className="input-base" min="0" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ต้นทุนต่อหน่วย (บาท)</label>
              <input type="number" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: e.target.value as any })} className="input-base" min="0" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ร้านค้า / ซัพพลายเออร์</label>
              <input type="text" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="input-base" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-4">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-base" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }} className="btn-secondary text-[13px]">ยกเลิก</button>
            <button type="submit" disabled={createItem.isPending || updateItem.isPending} className="btn-primary text-[13px]">บันทึก</button>
          </div>
        </form>
      )}

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>หมวดหมู่</th>
                <th className="text-right">คงเหลือ</th>
                <th className="text-right">ต้นทุน/หน่วย</th>
                <th className="text-right">มูลค่ารวม</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">กำลังโหลด...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">ยังไม่มีสินค้าในคลัง</td></tr>
              ) : (
                items.map(item => {
                  const isLowStock = item.quantity <= item.minQuantity;
                  return (
                    <tr key={item.id} className={isLowStock ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", isLowStock ? "bg-red-100 text-red-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500")}>
                            <PackageOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                              {item.name}
                              {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                            </p>
                            {item.supplier && <p className="text-[10px] text-gray-400">จาก: {item.supplier}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className={cn("font-bold text-[13px] num", isLowStock ? "text-red-600" : "text-gray-900 dark:text-white")}>
                          {item.quantity}
                        </span>
                        <span className="text-[11px] text-gray-500 ml-1">{item.unit}</span>
                      </td>
                      <td className="text-right text-[13px] text-gray-600 dark:text-gray-300 num">{formatBaht(item.costPerUnit)}</td>
                      <td className="text-right font-bold text-[13px] text-gray-900 dark:text-white num">{formatBaht(item.quantity * item.costPerUnit)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(item)} aria-label="แก้ไขสินค้า" title="แก้ไข" className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => { if(confirm("ลบสินค้านี้?")) deleteItem.mutate({ id: item.id }); }} aria-label="ลบสินค้า" title="ลบ" className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
