import { useState, useMemo } from "react";
import { 
  useListWorkers, useCreateWorker, useUpdateWorker, useDeleteWorker, getListWorkersQueryKey,
  useListAttendance, useCreateAttendance, useDeleteAttendance, getListAttendanceQueryKey,
  Worker, WorkerStatus, AttendanceStatus, WorkerInputStatus, AttendanceInputStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, User, Phone, Briefcase, Calendar, Trash2, Pencil, Check, X, Clock, CalendarDays } from "lucide-react";
import { cn, formatBaht } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";

const emptyWorker = () => ({ name: "", role: "", phone: "", status: "active" as WorkerInputStatus, hireDate: new Date().toISOString().split("T")[0], dailyWage: "", notes: "" });

export default function Workers() {
  const { user } = useAuthContext();
  const isAuthed = !!user?.id;
  const qc = useQueryClient();

  const { data: workers = [], isLoading } = useListWorkers({ query: { queryKey: getListWorkersQueryKey(), enabled: isAuthed } });
  
  const createWorker = useCreateWorker({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListWorkersQueryKey() }); setShowForm(false); setForm(emptyWorker()); } } });
  const updateWorker = useUpdateWorker({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListWorkersQueryKey() }); setEditId(null); setForm(emptyWorker()); setShowForm(false); } } });
  const deleteWorker = useDeleteWorker({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListWorkersQueryKey() }) } });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyWorker());
  
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  const selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const { data: attendances = [] } = useListAttendance(
    { workerId: selectedWorker || undefined, month: selectedMonth }, 
    { query: { queryKey: getListAttendanceQueryKey({ workerId: selectedWorker || undefined, month: selectedMonth }), enabled: !!selectedWorker && isAuthed } }
  );

  const createAttendance = useCreateAttendance({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListAttendanceQueryKey() }) } });

  function startEdit(w: Worker) {
    setEditId(w.id);
    setForm({ name: w.name, role: w.role, phone: w.phone || "", status: w.status, hireDate: w.hireDate, dailyWage: String(w.dailyWage), notes: w.notes || "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name: form.name, role: form.role, phone: form.phone || undefined, status: form.status, hireDate: form.hireDate, dailyWage: parseFloat(form.dailyWage) || 0, notes: form.notes || undefined };
    editId !== null ? updateWorker.mutate({ id: editId, data }) : createWorker.mutate({ data });
  }

  function markAttendance(status: AttendanceInputStatus) {
    if (!selectedWorker) return;
    const today = new Date().toISOString().split("T")[0];
    createAttendance.mutate({ data: { workerId: selectedWorker, date: today, status } });
  }

  const activeCount = workers.filter(w => w.status === "active").length;

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">บุคลากร (Workers)</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">พนักงานทั้งหมด {workers.length} คน (ทำงาน {activeCount} คน)</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyWorker()); }} className="btn-primary text-[13px]">
          {showForm && !editId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm && !editId ? "ยกเลิก" : "เพิ่มพนักงาน"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-premium p-6">
          <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white mb-4">{editId ? "แก้ไขพนักงาน" : "เพิ่มพนักงานใหม่"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ชื่อ-นามสกุล</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-base" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ตำแหน่ง / หน้าที่</label>
              <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-base" placeholder="เช่น คนงานทั่วไป, คนพ่นยา" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">เบอร์โทรศัพท์</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-base" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">วันที่เริ่มงาน</label>
              <input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} className="input-base" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ค่าแรงรายวัน (บาท)</label>
              <input type="number" value={form.dailyWage} onChange={e => setForm({ ...form, dailyWage: e.target.value })} className="input-base" min="0" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">สถานะ</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as WorkerInputStatus })} className="input-base">
                <option value="active">ทำงาน</option>
                <option value="inactive">ลาออก/พักงาน</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-base" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyWorker()); }} className="btn-secondary text-[13px]">ยกเลิก</button>
            <button type="submit" disabled={createWorker.isPending || updateWorker.isPending} className="btn-primary text-[13px]">บันทึก</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)
          ) : workers.map(worker => (
            <div 
              key={worker.id} 
              className={cn("card-premium p-4 flex gap-4 cursor-pointer transition-all", selectedWorker === worker.id ? "ring-2 ring-green-500 border-transparent" : "hover:border-green-300")}
              onClick={() => setSelectedWorker(worker.id)}
            >
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 font-bold shrink-0">
                {worker.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {worker.name}
                      <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", worker.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                        {worker.status === "active" ? "ทำงาน" : "ไม่ทำงาน"}
                      </span>
                    </h3>
                    <p className="text-[12px] text-gray-500 flex items-center gap-1.5 mt-1"><Briefcase className="w-3.5 h-3.5" /> {worker.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">{formatBaht(worker.dailyWage)}<span className="text-[10px] font-normal text-gray-400">/วัน</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
                  {worker.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {worker.phone}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> เริ่มงาน: {new Date(worker.hireDate).toLocaleDateString("th-TH", { year: "2-digit", month: "short", day: "numeric" })}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0 border-l border-gray-100 dark:border-gray-800 pl-3 ml-2">
                <button onClick={(e) => { e.stopPropagation(); startEdit(worker); }} aria-label="แก้ไขพนักงาน" title="แก้ไข" className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); if(confirm("ลบพนักงานนี้?")) deleteWorker.mutate({ id: worker.id }); }} aria-label="ลบพนักงาน" title="ลบ" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="card-premium p-5 h-fit sticky top-20">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-green-600" />
            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white">การมาทำงานวันนี้</h3>
          </div>
          
          {!selectedWorker ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-gray-400">เลือกพนักงานเพื่อบันทึกและดูการมาทำงาน</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[13px] font-medium text-gray-800 dark:text-gray-200">
                บันทึกเวลาของ: <span className="text-green-600 dark:text-green-400 font-bold">{workers.find(w => w.id === selectedWorker)?.name}</span>
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => markAttendance("present")} className="py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-[12px] font-bold hover:bg-green-100 transition-colors">มาเต็มวัน</button>
                <button onClick={() => markAttendance("half_day")} className="py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-[12px] font-bold hover:bg-amber-100 transition-colors">มาครึ่งวัน</button>
                <button onClick={() => markAttendance("leave")} className="py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-[12px] font-bold hover:bg-blue-100 transition-colors">ลากิจ/ลาป่วย</button>
                <button onClick={() => markAttendance("absent")} className="py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-[12px] font-bold hover:bg-red-100 transition-colors">ขาดงาน</button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-semibold text-gray-500 mb-3">ประวัติเดือนนี้</p>
                {attendances.length === 0 ? (
                  <p className="text-[12px] text-gray-400 italic">ไม่มีบันทึกในเดือนนี้</p>
                ) : (
                  <div className="space-y-2">
                    {attendances.slice(0, 5).map(att => (
                      <div key={att.id} className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-600 dark:text-gray-300">{new Date(att.date).toLocaleDateString("th-TH", { day: 'numeric', month: 'short' })}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", 
                          att.status === "present" ? "bg-green-100 text-green-700" :
                          att.status === "half_day" ? "bg-amber-100 text-amber-700" :
                          att.status === "leave" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                        )}>
                          {att.status === "present" ? "เต็มวัน" : att.status === "half_day" ? "ครึ่งวัน" : att.status === "leave" ? "ลา" : "ขาด"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
