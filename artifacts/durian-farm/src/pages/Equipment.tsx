import { useState } from "react";
import { 
  useListEquipment, useCreateEquipment, useUpdateEquipment, useDeleteEquipment, getListEquipmentQueryKey,
  Equipment, EquipmentInputStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Settings, AlertTriangle, Hammer, CheckCircle2, Pencil, Trash2, X, Cog, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";

const STATUSES = [
  { value: "operational", label: "ใช้งานได้", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/40", icon: CheckCircle2 },
  { value: "maintenance", label: "กำลังซ่อม", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/40", icon: Wrench },
  { value: "broken", label: "ชำรุด", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/40", icon: AlertTriangle },
  { value: "retired", label: "เลิกใช้งาน", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800", icon: Archive },
];

function Archive({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="5" x="2" y="4" rx="2" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  );
}

const emptyForm = () => ({ name: "", type: "เครื่องจักรกล", status: "operational" as EquipmentInputStatus, purchaseDate: "", lastMaintenanceDate: "", nextMaintenanceDate: "", notes: "" });

export default function EquipmentPage() {
  const { user } = useAuthContext();
  const isAuthed = !!user?.id;
  const qc = useQueryClient();

  const { data: equipment = [], isLoading } = useListEquipment({ query: { queryKey: getListEquipmentQueryKey(), enabled: isAuthed } });

  const createEquipment = useCreateEquipment({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListEquipmentQueryKey() }); setShowForm(false); setForm(emptyForm()); } } });
  const updateEquipment = useUpdateEquipment({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListEquipmentQueryKey() }); setEditId(null); setForm(emptyForm()); setShowForm(false); } } });
  const deleteEquipment = useDeleteEquipment({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListEquipmentQueryKey() }) } });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());

  function startEdit(eq: Equipment) {
    setEditId(eq.id);
    setForm({ name: eq.name, type: eq.type, status: eq.status, purchaseDate: eq.purchaseDate || "", lastMaintenanceDate: eq.lastMaintenanceDate || "", nextMaintenanceDate: eq.nextMaintenanceDate || "", notes: eq.notes || "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form, purchaseDate: form.purchaseDate || undefined, lastMaintenanceDate: form.lastMaintenanceDate || undefined, nextMaintenanceDate: form.nextMaintenanceDate || undefined, notes: form.notes || undefined };
    editId !== null ? updateEquipment.mutate({ id: editId, data }) : createEquipment.mutate({ data });
  }

  const getStatusInfo = (s: string) => STATUSES.find(x => x.value === s) || STATUSES[0];

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">เครื่องมือเครื่องจักร (Equipment)</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">ติดตามสถานะและกำหนดการซ่อมบำรุง</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }} className="btn-primary text-[13px]">
          {showForm && !editId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm && !editId ? "ยกเลิก" : "เพิ่มเครื่องมือ"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-premium p-6">
          <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-4">{editId ? "แก้ไขเครื่องมือ" : "เพิ่มเครื่องมือใหม่"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ชื่อเครื่องมือ/เครื่องจักร</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ประเภท</label>
              <input type="text" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-base" placeholder="เช่น เครื่องจักรกล, ปั๊มน้ำ" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">สถานะ</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as EquipmentInputStatus })} className="input-base">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">วันที่ซื้อ (ถ้ามี)</label>
              <input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} className="input-base" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ซ่อมบำรุงล่าสุด (ถ้ามี)</label>
              <input type="date" value={form.lastMaintenanceDate} onChange={e => setForm({ ...form, lastMaintenanceDate: e.target.value })} className="input-base" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">กำหนดการซ่อมบำรุงครั้งหน้า (ถ้ามี)</label>
              <input type="date" value={form.nextMaintenanceDate} onChange={e => setForm({ ...form, nextMaintenanceDate: e.target.value })} className="input-base" />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-base" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }} className="btn-secondary text-[13px]">ยกเลิก</button>
            <button type="submit" disabled={createEquipment.isPending || updateEquipment.isPending} className="btn-primary text-[13px]">บันทึก</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="skeleton h-40" />)
        ) : equipment.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-10 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Cog className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-[13px] text-gray-400">ยังไม่มีข้อมูลเครื่องมือเครื่องจักร</p>
          </div>
        ) : (
          equipment.map(eq => {
            const st = getStatusInfo(eq.status);
            const needsMaint = eq.nextMaintenanceDate && new Date(eq.nextMaintenanceDate) < new Date(new Date().setHours(0,0,0,0) + 7*24*60*60*1000); // within 7 days
            return (
              <div key={eq.id} className={cn("card-premium p-5 border relative overflow-hidden", eq.status === "broken" ? "border-red-200 dark:border-red-900/50" : "")}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", st.bg, st.color)}>
                      <st.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">{eq.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{eq.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => startEdit(eq)} aria-label="แก้ไขเครื่องมือ" title="แก้ไข" className="p-1 text-gray-400 hover:text-green-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if(confirm("ลบเครื่องมือนี้?")) deleteEquipment.mutate({ id: eq.id }); }} aria-label="ลบเครื่องมือ" title="ลบ" className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="space-y-2 text-[12px]">
                  <div className="flex justify-between border-b border-gray-50 dark:border-gray-800/50 pb-2">
                    <span className="text-gray-500">สถานะ</span>
                    <span className={cn("font-bold px-2 py-0.5 rounded-full text-[10px]", st.bg, st.color)}>{st.label}</span>
                  </div>
                  {eq.purchaseDate && (
                    <div className="flex justify-between border-b border-gray-50 dark:border-gray-800/50 pb-2">
                      <span className="text-gray-500">วันที่ซื้อ</span>
                      <span className="text-gray-900 dark:text-gray-300 font-medium num">{new Date(eq.purchaseDate).toLocaleDateString("th-TH")}</span>
                    </div>
                  )}
                  {eq.nextMaintenanceDate && (
                    <div className="flex justify-between pt-1">
                      <span className={cn("flex items-center gap-1", needsMaint ? "text-red-500 font-semibold" : "text-gray-500")}>
                        {needsMaint && <AlertTriangle className="w-3.5 h-3.5" />} ซ่อมบำรุงครั้งถัดไป
                      </span>
                      <span className={cn("font-medium num", needsMaint ? "text-red-600" : "text-gray-900 dark:text-gray-300")}>
                        {new Date(eq.nextMaintenanceDate).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
