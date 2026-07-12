import { useState } from "react";
import { useListPlots, useCreatePlot, useUpdatePlot, useDeletePlot } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber, VARIETIES } from "@/lib/utils";
import { Sprout, Plus, Pencil, Trash2, Map, TreePine, Layers, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type PlotItem = { id: number; name: string; areRai: number; treeCount: number; variety: string; treeAge: number; plantedDate: string; notes?: string | null; status: string; density: number; };

const STATUS_CONFIG: Record<string, { badge: string; dot: string }> = {
  "ยังไม่ให้ผล":    { badge: "badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/50",   dot: "bg-amber-400" },
  "เริ่มให้ผลน้อย": { badge: "badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/50",    dot: "bg-blue-400"  },
  "ให้ผลเต็มที่":   { badge: "badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200/50",   dot: "bg-green-500" },
};

const OPTIMAL: Record<string, string> = { "หมอนทอง": "16–20", "ชะนี": "20–25", default: "16–25" };
const emptyForm = () => ({ name: "", areRai: "", treeCount: "", variety: VARIETIES[0]!, treeAge: "", plantedDate: "", notes: "" });

const ACCENT_COLORS = [
  { icon: "bg-green-500",  light: "bg-green-50 dark:bg-green-950/20",  border: "border-green-200 dark:border-green-900/50" },
  { icon: "bg-blue-500",   light: "bg-blue-50 dark:bg-blue-950/20",    border: "border-blue-200 dark:border-blue-900/50"   },
  { icon: "bg-violet-500", light: "bg-violet-50 dark:bg-violet-950/20",border: "border-violet-200 dark:border-violet-900/50" },
  { icon: "bg-amber-500",  light: "bg-amber-50 dark:bg-amber-950/20",  border: "border-amber-200 dark:border-amber-900/50" },
];

export default function Plots() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: plots = [], isLoading } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });
  
  const createPlot = useCreatePlot({ 
    mutation: { 
      onSuccess: () => { 
        qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }); 
        setShowForm(false); 
        setForm(emptyForm()); 
        toast({ title: "เพิ่มแปลงสำเร็จ", description: "ข้อมูลแปลงใหม่ถูกบันทึกเข้าระบบแล้ว" });
      },
      onError: () => toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกข้อมูลแปลงได้", variant: "destructive" })
    } 
  });
  
  const updatePlot = useUpdatePlot({ 
    mutation: { 
      onSuccess: () => { 
        qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }); 
        setEditId(null); 
        setForm(emptyForm()); 
        setShowForm(false); 
        toast({ title: "อัปเดตข้อมูลสำเร็จ", description: "บันทึกการแก้ไขข้อมูลแปลงเรียบร้อยแล้ว" });
      },
      onError: () => toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอัปเดตข้อมูลแปลงได้", variant: "destructive" })
    } 
  });
  
  const deletePlot = useDeletePlot({ 
    mutation: { 
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListPlotsQueryKey() });
        toast({ title: "ลบแปลงสำเร็จ", description: "ข้อมูลแปลงถูกลบออกจากระบบแล้ว" });
      },
      onError: () => toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถลบข้อมูลแปลงได้", variant: "destructive" })
    } 
  });

  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<number | null>(null);
  const [form,     setForm]     = useState(emptyForm());

  function startEdit(p: PlotItem) {
    setEditId(p.id);
    setForm({ name: p.name, areRai: String(p.areRai), treeCount: String(p.treeCount), variety: p.variety, treeAge: String(p.treeAge), plantedDate: p.plantedDate, notes: p.notes ?? "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name: form.name, areRai: parseFloat(form.areRai), treeCount: parseInt(form.treeCount), variety: form.variety, treeAge: parseInt(form.treeAge), plantedDate: form.plantedDate, notes: form.notes || undefined };
    editId !== null ? updatePlot.mutate({ id: editId, data }) : createPlot.mutate({ data });
  }

  const totalRai   = plots.reduce((s, p) => s + p.areRai, 0);
  const totalTrees = plots.reduce((s, p) => s + p.treeCount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 page-enter stagger">

      {/* ── Page Header ── */}
      <div className="relative h-32 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <img src="/images/durian-on-tree-web.jpg" alt="ทุเรียนบนต้น" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">จัดการแปลง</h1>
              <p className="text-sm text-white/70 mt-1">ข้อมูลเชิงลึกแปลงทุเรียนทั้งหมดในฟาร์มของคุณ</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold rounded-xl transition-all shadow-sm focus-ring"
          >
            {showForm && !editId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm && !editId ? "ยกเลิก" : "เพิ่มแปลงใหม่"}
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {plots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {[
            { label: "จำนวนแปลง", value: `${plots.length} แปลง`, icon: Layers,   accentClass: "blue",  iconBg: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"     },
            { label: "พื้นที่รวม",  value: `${totalRai} ไร่`,     icon: Map,      accentClass: "green", iconBg: "bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400"   },
            { label: "ต้นทั้งหมด", value: `${formatNumber(totalTrees)} ต้น`, icon: TreePine, accentClass: "amber", iconBg: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
          ].map(s => (
            <div key={s.label} className={cn("stat-card", s.accentClass)}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.iconBg)}>
                  <s.icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white num tabular-nums leading-none">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-premium p-6 sm:p-8 fade-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
              <Sprout className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editId ? "แก้ไขข้อมูลแปลง" : "เพิ่มแปลงใหม่"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {([
              ["ชื่อแปลง",      "name",        "text",   "เช่น แปลงเหนือ", false],
              ["พื้นที่ (ไร่)", "areRai",      "number", "เช่น 5.5",       false],
              ["จำนวนต้น",     "treeCount",   "number", "เช่น 120",       false],
              ["อายุต้น (ปี)", "treeAge",     "number", "เช่น 5",         false],
              ["วันที่ปลูก",   "plantedDate", "date",   "",               false],
            ] as [string,string,string,string,boolean][]).map(([label, key, type, ph, optional]) => (
              <div key={key} className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label} {!optional && <span className="text-red-500">*</span>}</label>
                <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="input-base" placeholder={ph} required={!optional}
                  min={type === "number" ? "0" : undefined} step={key === "areRai" ? "0.1" : undefined} />
              </div>
            ))}
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">สายพันธุ์ <span className="text-red-500">*</span></label>
              <select value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} className="input-base cursor-pointer">
                {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2 lg:col-span-3">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">หมายเหตุ</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-base" placeholder="รายละเอียดเพิ่มเติมของแปลง (ไม่บังคับ)" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }} className="btn-secondary text-sm">ยกเลิก</button>
            <button type="submit" disabled={createPlot.isPending || updatePlot.isPending} className="btn-primary text-sm min-w-[120px] justify-center">
              {(createPlot.isPending || updatePlot.isPending) ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> กำลังบันทึก...</span>
              ) : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      )}

      {/* ── Plot Cards ── */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-[280px] rounded-2xl" />)}
        </div>
      ) : plots.length === 0 ? (
        <div className="card-premium p-16 text-center flex flex-col items-center justify-center fade-up">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
            <Sprout className="w-10 h-10 text-green-500 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">ยังไม่มีข้อมูลแปลงในระบบ</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            เริ่มต้นเพิ่มแปลงทุเรียนของคุณเพื่อบันทึกข้อมูลประวัติ ต้นทุน และใช้สำหรับการวิเคราะห์ปุ๋ยหรือการทำนายผลผลิต
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5">
            <Plus className="w-4 h-4" /> เพิ่มแปลงใหม่
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {plots.map((plot, idx) => {
            const colors = ACCENT_COLORS[idx % ACCENT_COLORS.length]!;
            const sc = STATUS_CONFIG[plot.status as keyof typeof STATUS_CONFIG] ?? { badge: "badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", dot: "bg-gray-400" };
            return (
              <div key={plot.id} className={cn("card-premium flex flex-col p-6 hover:-translate-y-1 transition-transform duration-300", colors.border)} style={{ animationDelay: `${idx * 100}ms` }}>
                {/* Card header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0", colors.icon)}>
                      <TreePine className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{plot.name}</h3>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">สายพันธุ์: {plot.variety}</p>
                    </div>
                  </div>
                  <span className={cn(sc.badge, "px-2.5 py-1 text-xs")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full inline-block mr-1.5", sc.dot)}></span>
                    {plot.status}
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "พื้นที่",       val: `${plot.areRai} ไร่`              },
                    { label: "จำนวนต้น",      val: `${formatNumber(plot.treeCount)} ต้น` },
                    { label: "อายุต้น",       val: `${plot.treeAge} ปี`              },
                    { label: "ความหนาแน่น",   val: `${plot.density} ต้น/ไร่`         },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50/80 dark:bg-gray-800/40 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800/60">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 num tabular-nums">{item.val}</p>
                    </div>
                  ))}
                </div>

                {/* Optimal density hint */}
                <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/50 dark:border-blue-900/30 mt-auto mb-4">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300">ความหนาแน่นแนะนำ</p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">{OPTIMAL[plot.variety] ?? OPTIMAL.default} ต้น/ไร่</p>
                  </div>
                </div>

                {plot.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-5 px-1 truncate">"{plot.notes}"</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                  <button
                    onClick={() => startEdit(plot as PlotItem)}
                    className="flex-1 btn-secondary text-xs py-2 justify-center"
                  >
                    <Pencil className="w-3.5 h-3.5" /> แก้ไขข้อมูล
                  </button>
                  <button
                    onClick={() => { if (confirm(`คุณต้องการลบแปลง "${plot.name}" ใช่หรือไม่? ข้อมูลประวัติทั้งหมดจะถูกลบด้วย`)) deletePlot.mutate({ id: plot.id }); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 focus-ring"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> ลบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
