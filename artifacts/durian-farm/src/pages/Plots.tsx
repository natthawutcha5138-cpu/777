import { useState } from "react";
import { useListPlots, useCreatePlot, useUpdatePlot, useDeletePlot } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber, VARIETIES } from "@/lib/utils";
import { Sprout, Plus, Pencil, Trash2, Map, TreePine, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";

type PlotItem = { id: number; name: string; areRai: number; treeCount: number; variety: string; treeAge: number; plantedDate: string; notes?: string | null; status: string; density: number; };

const STATUS_CONFIG: Record<string, { badge: string; dot: string }> = {
  "ยังไม่ให้ผล":    { badge: "badge badge-amber",   dot: "bg-amber-400" },
  "เริ่มให้ผลน้อย": { badge: "badge badge-blue",    dot: "bg-blue-400"  },
  "ให้ผลเต็มที่":   { badge: "badge badge-green",   dot: "bg-green-500" },
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
  const { data: plots = [], isLoading } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });
  const createPlot = useCreatePlot({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }); setShowForm(false); setForm(emptyForm()); } } });
  const updatePlot = useUpdatePlot({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }); setEditId(null); setForm(emptyForm()); setShowForm(false); } } });
  const deletePlot = useDeletePlot({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }) } });

  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<number | null>(null);
  const [form,     setForm]     = useState(emptyForm());

  function startEdit(p: PlotItem) {
    setEditId(p.id);
    setForm({ name: p.name, areRai: String(p.areRai), treeCount: String(p.treeCount), variety: p.variety, treeAge: String(p.treeAge), plantedDate: p.plantedDate, notes: p.notes ?? "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name: form.name, areRai: parseFloat(form.areRai), treeCount: parseInt(form.treeCount), variety: form.variety, treeAge: parseInt(form.treeAge), plantedDate: form.plantedDate, notes: form.notes || undefined };
    editId !== null ? updatePlot.mutate({ id: editId, data }) : createPlot.mutate({ data });
  }

  const totalRai   = plots.reduce((s, p) => s + p.areRai, 0);
  const totalTrees = plots.reduce((s, p) => s + p.treeCount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">

      {/* ── Page Header ── */}
      <div className="relative h-28 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <img src="/images/durian-on-tree-web.jpg" alt="ทุเรียนบนต้น" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/75 via-gray-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
              <Sprout className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-white tracking-tight">จัดการแปลง</h1>
              <p className="text-[11px] text-white/60 mt-0.5">ข้อมูลแปลงทุเรียนทุกแปลง</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-[13px] font-semibold rounded-xl border border-white/20 transition-all"
          >
            {showForm && !editId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm && !editId ? "ยกเลิก" : "เพิ่มแปลง"}
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {plots.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "จำนวนแปลง", value: `${plots.length} แปลง`, icon: Layers,   accentClass: "blue",  iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400"     },
            { label: "พื้นที่รวม",  value: `${totalRai} ไร่`,     icon: Map,      accentClass: "green", iconBg: "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"   },
            { label: "ต้นทั้งหมด", value: `${formatNumber(totalTrees)} ต้น`, icon: TreePine, accentClass: "amber", iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
          ].map(s => (
            <div key={s.label} className={cn("stat-card", s.accentClass)}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-medium text-gray-400">{s.label}</p>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", s.iconBg)}>
                  <s.icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-[22px] font-extrabold text-gray-900 dark:text-white num leading-none">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-premium p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">
              {editId ? "แก้ไขข้อมูลแปลง" : "เพิ่มแปลงใหม่"}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {([
              ["ชื่อแปลง",      "name",        "text",   "เช่น แปลงเหนือ", false],
              ["พื้นที่ (ไร่)", "areRai",      "number", "0.0",            false],
              ["จำนวนต้น",     "treeCount",   "number", "0",              false],
              ["อายุต้น (ปี)", "treeAge",     "number", "0",              false],
              ["วันที่ปลูก",   "plantedDate", "date",   "",               false],
              ["หมายเหตุ",     "notes",       "text",   "ไม่บังคับ",      true ],
            ] as [string,string,string,string,boolean][]).map(([label, key, type, ph, optional]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="input-base" placeholder={ph} required={!optional}
                  min={type === "number" ? "0" : undefined} step={key === "areRai" ? "0.1" : undefined} />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">สายพันธุ์</label>
              <select value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} className="input-base">
                {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }} className="btn-secondary text-[13px]">ยกเลิก</button>
            <button type="submit" disabled={createPlot.isPending || updatePlot.isPending} className="btn-primary text-[13px] disabled:opacity-50">
              {(createPlot.isPending || updatePlot.isPending) ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      {/* ── Plot Cards ── */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-52" />)}
        </div>
      ) : plots.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">ยังไม่มีข้อมูลแปลง</p>
          <p className="text-[12px] text-gray-400 mt-1 mb-4">กดปุ่ม "เพิ่มแปลง" เพื่อเริ่มต้น</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" /> เพิ่มแปลง
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {plots.map((plot, idx) => {
            const colors = ACCENT_COLORS[idx % ACCENT_COLORS.length]!;
            const sc = STATUS_CONFIG[plot.status] ?? { badge: "badge badge-gray", dot: "bg-gray-400" };
            return (
              <div key={plot.id} className={cn("card-premium p-5 border", colors.border)}>
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0", colors.icon)}>
                      <TreePine className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight">{plot.name}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{plot.variety}</p>
                    </div>
                  </div>
                  <span className={sc.badge}>{plot.status}</span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "พื้นที่",       val: `${plot.areRai} ไร่`              },
                    { label: "จำนวนต้น",      val: `${formatNumber(plot.treeCount)} ต้น` },
                    { label: "อายุต้น",       val: `${plot.treeAge} ปี`              },
                    { label: "ความหนาแน่น",   val: `${plot.density} ต้น/ไร่`         },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 num">{item.val}</p>
                    </div>
                  ))}
                </div>

                {/* Optimal density hint */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl mb-3">
                  <span className="text-[10px] text-gray-400">💡 ความหนาแน่นแนะนำ:</span>
                  <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">{OPTIMAL[plot.variety] ?? OPTIMAL.default} ต้น/ไร่</span>
                </div>

                {plot.notes && (
                  <p className="text-[12px] text-gray-400 italic mb-3 px-1 truncate">{plot.notes}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => startEdit(plot as PlotItem)}
                    className="btn-secondary text-[12px] py-1.5 flex-1 justify-center"
                  >
                    <Pencil className="w-3.5 h-3.5" /> แก้ไข
                  </button>
                  <button
                    onClick={() => { if (confirm("ต้องการลบแปลงนี้?")) deletePlot.mutate({ id: plot.id }); }}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-gray-200 dark:border-gray-700 flex items-center gap-1.5"
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
