import { useState } from "react";
import { useListPlots, useCreatePlot, useUpdatePlot, useDeletePlot } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber, VARIETIES } from "@/lib/utils";

type PlotItem = {
  id: number; name: string; areRai: number; treeCount: number; variety: string;
  treeAge: number; plantedDate: string; notes?: string | null; status: string; density: number;
};

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  "ยังไม่ให้ผล":    { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400" },
  "เริ่มให้ผลน้อย": { bg: "bg-sky-100",     text: "text-sky-700",     dot: "bg-sky-400" },
  "ให้ผลเต็มที่":   { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
};

const varietyEmoji: Record<string, string> = { "หมอนทอง": "👑", "ชะนี": "🌙", "กระดุม": "🟡", default: "🌿" };

const OPTIMAL_DENSITY: Record<string, string> = {
  "หมอนทอง": "16–20 ต้น/ไร่", "ชะนี": "20–25 ต้น/ไร่", default: "16–25 ต้น/ไร่",
};

function emptyForm() {
  return { name: "", areRai: "", treeCount: "", variety: VARIETIES[0], treeAge: "", plantedDate: "", notes: "" };
}

export default function Plots() {
  const qc = useQueryClient();
  const { data: plots = [], isLoading } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });
  const createPlot = useCreatePlot({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }); setShowForm(false); setForm(emptyForm()); } } });
  const updatePlot = useUpdatePlot({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }); setEditId(null); setForm(emptyForm()); } } });
  const deletePlot = useDeletePlot({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListPlotsQueryKey() }); } } });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());

  function startEdit(plot: PlotItem) {
    setEditId(plot.id);
    setForm({ name: plot.name, areRai: String(plot.areRai), treeCount: String(plot.treeCount), variety: plot.variety, treeAge: String(plot.treeAge), plantedDate: plot.plantedDate, notes: plot.notes ?? "" });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name: form.name, areRai: parseFloat(form.areRai), treeCount: parseInt(form.treeCount), variety: form.variety, treeAge: parseInt(form.treeAge), plantedDate: form.plantedDate, notes: form.notes || undefined };
    if (editId !== null) updatePlot.mutate({ id: editId, data });
    else createPlot.mutate({ data });
  }

  const inputCls = "border border-border/60 rounded-xl px-3 py-2 text-sm bg-white/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const totalTrees = plots.reduce((s, p) => s + p.treeCount, 0);
  const totalArea = plots.reduce((s, p) => s + p.areRai, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ข้อมูลแปลง</h1>
          <p className="text-sm text-muted-foreground mt-0.5">จัดการข้อมูลแปลงทุเรียนทุกแปลง</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-sm">
          {showForm && editId === null ? "✕ ยกเลิก" : "+ เพิ่มแปลง"}
        </button>
      </div>

      {plots.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "แปลงทั้งหมด", value: `${plots.length} แปลง`, icon: "🗺️", bg: "from-sky-50 to-blue-50", border: "border-sky-200/50", color: "text-sky-600" },
            { label: "พื้นที่รวม", value: `${totalArea} ไร่`, icon: "📐", bg: "from-teal-50 to-cyan-50", border: "border-teal-200/50", color: "text-teal-600" },
            { label: "ต้นทั้งหมด", value: `${formatNumber(totalTrees)} ต้น`, icon: "🌳", bg: "from-green-50 to-lime-50", border: "border-green-200/50", color: "text-green-600" },
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
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/90 border border-border/50 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">{editId ? "✏️ แก้ไขข้อมูลแปลง" : "🌱 เพิ่มแปลงใหม่"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "ชื่อแปลง", key: "name", type: "text", placeholder: "เช่น แปลงเหนือ" },
              { label: "พื้นที่ (ไร่)", key: "areRai", type: "number", placeholder: "0" },
              { label: "จำนวนต้น", key: "treeCount", type: "number", placeholder: "0" },
              { label: "อายุต้น (ปี)", key: "treeAge", type: "number", placeholder: "0" },
              { label: "วันที่ปลูก", key: "plantedDate", type: "date", placeholder: "" },
              { label: "หมายเหตุ", key: "notes", type: "text", placeholder: "ไม่บังคับ" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputCls} placeholder={placeholder} required={key !== "notes"}
                  min={type === "number" ? "0" : undefined} step={key === "areRai" ? "0.1" : undefined} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">สายพันธุ์</label>
              <select value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} className={inputCls}>
                {VARIETIES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }}
              className="px-4 py-2 text-sm border border-border/60 rounded-xl text-foreground hover:bg-muted/40 transition-colors">ยกเลิก</button>
            <button type="submit" disabled={createPlot.isPending || updatePlot.isPending}
              className="px-5 py-2 text-sm bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm">
              {(createPlot.isPending || updatePlot.isPending) ? "กำลังบันทึก..." : "✓ บันทึก"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white/60 border border-border/40 rounded-2xl p-5 h-44 animate-pulse" />)}
        </div>
      ) : plots.length === 0 ? (
        <div className="bg-white/80 border border-border/50 rounded-2xl p-14 text-center shadow-sm">
          <p className="text-3xl mb-3">🌱</p>
          <p className="text-muted-foreground">ยังไม่มีข้อมูลแปลง<br />กดปุ่ม "เพิ่มแปลง" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {plots.map((plot) => {
            const st = statusStyles[plot.status] ?? { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" };
            const emoji = varietyEmoji[plot.variety] ?? varietyEmoji.default;
            return (
              <div key={plot.id} className="bg-white/85 border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-teal-100 border border-green-200/50 flex items-center justify-center text-lg shadow-sm">
                      {emoji}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{plot.name}</h3>
                      <p className="text-xs text-muted-foreground">{plot.variety}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${st.bg} ${st.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {plot.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm mb-3">
                  {[
                    { label: "📐 พื้นที่", value: `${plot.areRai} ไร่` },
                    { label: "🌳 จำนวนต้น", value: `${formatNumber(plot.treeCount)} ต้น` },
                    { label: "📅 อายุต้น", value: `${plot.treeAge} ปี` },
                    { label: "🔢 ความหนาแน่น", value: `${plot.density} ต้น/ไร่` },
                  ].map((info) => (
                    <div key={info.label} className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">{info.label}</span>
                      <span className="font-semibold text-foreground">{info.value}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground mb-3 px-2.5 py-1.5 bg-muted/30 rounded-lg">
                  แนะนำ: {OPTIMAL_DENSITY[plot.variety] ?? OPTIMAL_DENSITY.default}
                </div>

                {plot.notes && <p className="text-xs text-muted-foreground italic mb-3">💬 {plot.notes}</p>}

                <div className="flex gap-2 pt-2 border-t border-border/40">
                  <button onClick={() => startEdit(plot as PlotItem)}
                    className="px-3 py-1 text-xs text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors">✏️ แก้ไข</button>
                  <button onClick={() => { if (confirm("ต้องการลบแปลงนี้?")) deletePlot.mutate({ id: plot.id }); }}
                    className="px-3 py-1 text-xs text-muted-foreground rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors">🗑️ ลบ</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
