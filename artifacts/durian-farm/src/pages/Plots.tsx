import { useState } from "react";
import { useListPlots, useCreatePlot, useUpdatePlot, useDeletePlot } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber, VARIETIES } from "@/lib/utils";
import { Sprout, Plus, Pencil, Trash2, Map, TreePine, Layers } from "lucide-react";

type PlotItem = { id: number; name: string; areRai: number; treeCount: number; variety: string; treeAge: number; plantedDate: string; notes?: string | null; status: string; density: number; };

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "ยังไม่ให้ผล":    { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400"   },
  "เริ่มให้ผลน้อย": { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-400"    },
  "ให้ผลเต็มที่":   { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
};

const OPTIMAL: Record<string, string> = { "หมอนทอง": "16–20", "ชะนี": "20–25", default: "16–25" };

const emptyForm = () => ({ name: "", areRai: "", treeCount: "", variety: VARIETIES[0], treeAge: "", plantedDate: "", notes: "" });

const inputCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:bg-white transition-all w-full";

const plotColors = [
  { from: "from-green-100", to: "to-emerald-50",  accent: "bg-green-500"  },
  { from: "from-blue-100",  to: "to-sky-50",       accent: "bg-blue-500"   },
  { from: "from-violet-100",to: "to-purple-50",    accent: "bg-violet-500" },
  { from: "from-amber-100", to: "to-yellow-50",    accent: "bg-amber-500"  },
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
    <div className="space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-200">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ข้อมูลแปลง</h1>
            <p className="text-xs text-gray-400 mt-0.5">จัดการข้อมูลแปลงทุเรียนทุกแปลง</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-2xl hover:from-emerald-600 hover:to-green-700 shadow-md shadow-green-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          {showForm && !editId ? "ยกเลิก" : "เพิ่มแปลง"}
        </button>
      </div>

      {/* Summary Cards */}
      {plots.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "จำนวนแปลง", value: `${plots.length} แปลง`, icon: <Layers className="w-5 h-5 text-violet-500" />, bg: "from-violet-50 to-purple-100" },
            { label: "พื้นที่รวม",  value: `${totalRai} ไร่`,              icon: <Map className="w-5 h-5 text-blue-500" />,    bg: "from-blue-50 to-sky-100"    },
            { label: "ต้นทั้งหมด", value: `${formatNumber(totalTrees)} ต้น`, icon: <TreePine className="w-5 h-5 text-green-500" />, bg: "from-green-50 to-emerald-100" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-3xl p-5 shadow-sm`}>
              <div className="mb-3">{s.icon}</div>
              <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-5">
            {editId ? "✏️ แก้ไขข้อมูลแปลง" : "🌱 เพิ่มแปลงใหม่"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {([
              ["ชื่อแปลง",      "name",        "text",   "เช่น แปลงเหนือ", false],
              ["พื้นที่ (ไร่)", "areRai",      "number", "0.0", false],
              ["จำนวนต้น",     "treeCount",   "number", "0",   false],
              ["อายุต้น (ปี)", "treeAge",     "number", "0",   false],
              ["วันที่ปลูก",   "plantedDate", "date",   "",    false],
              ["หมายเหตุ",     "notes",       "text",   "ไม่บังคับ", true],
            ] as [string, string, string, string, boolean][]).map(([label, key, type, ph, optional]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputCls} placeholder={ph} required={!optional}
                  min={type === "number" ? "0" : undefined} step={key === "areRai" ? "0.1" : undefined} />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">สายพันธุ์</label>
              <select value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} className={inputCls}>
                {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
            <button type="submit" disabled={createPlot.isPending || updatePlot.isPending}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-60 shadow-md shadow-green-200">
              {(createPlot.isPending || updatePlot.isPending) ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      {/* Plot Cards */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-3xl h-52 animate-pulse shadow-sm" />)}
        </div>
      ) : plots.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 text-center shadow-sm">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-gray-500 text-sm font-medium">ยังไม่มีข้อมูลแปลง</p>
          <p className="text-gray-400 text-xs mt-1">กดปุ่ม "เพิ่มแปลง" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {plots.map((plot, idx) => {
            const colors = plotColors[idx % plotColors.length];
            const sc = statusConfig[plot.status] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
            return (
              <div key={plot.id} className={`bg-gradient-to-br ${colors.from} ${colors.to} rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${colors.accent} rounded-2xl flex items-center justify-center shadow-md`}>
                      <TreePine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{plot.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{plot.variety}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {plot.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    ["🗺️ พื้นที่",      `${plot.areRai} ไร่`],
                    ["🌳 จำนวนต้น",     `${formatNumber(plot.treeCount)} ต้น`],
                    ["📅 อายุต้น",       `${plot.treeAge} ปี`],
                    ["📐 ความหนาแน่น",  `${plot.density} ต้น/ไร่`],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="bg-white/60 rounded-2xl px-3 py-2.5">
                      <span className="text-[11px] text-gray-500 block mb-0.5">{lbl}</span>
                      <span className="text-sm font-bold text-gray-800">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white/50 rounded-xl px-3 py-2 text-xs text-gray-500 mb-3">
                  💡 แนะนำ {OPTIMAL[plot.variety] ?? OPTIMAL.default} ต้น/ไร่
                </div>

                {plot.notes && (
                  <p className="text-xs text-gray-500 italic mb-3 px-1">{plot.notes}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(plot as PlotItem)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/70 hover:bg-white rounded-xl text-xs font-semibold text-gray-700 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" /> แก้ไข
                  </button>
                  <button
                    onClick={() => { if (confirm("ต้องการลบแปลงนี้?")) deletePlot.mutate({ id: plot.id }); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/40 hover:bg-red-100 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-500 transition-all"
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
