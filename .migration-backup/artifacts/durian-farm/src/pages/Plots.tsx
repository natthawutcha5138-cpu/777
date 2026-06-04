import { useState } from "react";
import { useListPlots, useCreatePlot, useUpdatePlot, useDeletePlot } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber, VARIETIES } from "@/lib/utils";

type PlotItem = { id: number; name: string; areRai: number; treeCount: number; variety: string; treeAge: number; plantedDate: string; notes?: string | null; status: string; density: number; };

const statusStyle: Record<string, string> = {
  "ยังไม่ให้ผล":    "bg-amber-50 text-amber-700 border border-amber-200",
  "เริ่มให้ผลน้อย": "bg-blue-50  text-blue-700  border border-blue-200",
  "ให้ผลเต็มที่":   "bg-primary/10 text-primary border border-primary/20",
};

const OPTIMAL: Record<string, string> = { "หมอนทอง": "16–20", "ชะนี": "20–25", default: "16–25" };

const emptyForm = () => ({ name: "", areRai: "", treeCount: "", variety: VARIETIES[0], treeAge: "", plantedDate: "", notes: "" });

const inputCls = "border border-border rounded px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-full";

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">ข้อมูลแปลง</h1>
          <p className="text-sm text-muted-foreground mt-0.5">จัดการข้อมูลแปลงทุเรียนทุกแปลง</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors">
          {showForm && !editId ? "ยกเลิก" : "+ เพิ่มแปลง"}
        </button>
      </div>

      {plots.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "จำนวนแปลง", value: `${plots.length} แปลง` },
            { label: "พื้นที่รวม",   value: `${totalRai} ไร่` },
            { label: "ต้นทั้งหมด",  value: `${formatNumber(totalTrees)} ต้น` },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-4 shadow-xs">
              <p className="text-xs text-muted-foreground font-medium mb-1.5">{s.label}</p>
              <p className="text-lg font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border">
            {editId ? "แก้ไขข้อมูลแปลง" : "เพิ่มแปลงใหม่"}
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
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputCls} placeholder={ph} required={!optional}
                  min={type === "number" ? "0" : undefined} step={key === "areRai" ? "0.1" : undefined} />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">สายพันธุ์</label>
              <select value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} className={inputCls}>
                {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }}
              className="px-4 py-2 text-sm border border-border rounded text-foreground hover:bg-muted transition-colors">ยกเลิก</button>
            <button type="submit" disabled={createPlot.isPending || updatePlot.isPending}
              className="px-5 py-2 text-sm bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-60">
              {(createPlot.isPending || updatePlot.isPending) ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-card border border-border rounded-lg h-44 animate-pulse" />)}
        </div>
      ) : plots.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-sm">ยังไม่มีข้อมูลแปลง<br />กดปุ่ม "เพิ่มแปลง" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {plots.map(plot => (
            <div key={plot.id} className="bg-card border border-border rounded-lg p-5 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{plot.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{plot.variety}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${statusStyle[plot.status] ?? "bg-muted text-muted-foreground border border-border"}`}>
                  {plot.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                {[
                  ["พื้นที่",        `${plot.areRai} ไร่`],
                  ["จำนวนต้น",      `${formatNumber(plot.treeCount)} ต้น`],
                  ["อายุต้น",        `${plot.treeAge} ปี`],
                  ["ความหนาแน่น",   `${plot.density} ต้น/ไร่`],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{lbl}</span>
                    <span className="font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground bg-muted/40 rounded px-2.5 py-1.5 mb-3">
                แนะนำ {OPTIMAL[plot.variety] ?? OPTIMAL.default} ต้น/ไร่
              </p>
              {plot.notes && <p className="text-xs text-muted-foreground italic mb-3">{plot.notes}</p>}
              <div className="flex gap-3 pt-1">
                <button onClick={() => startEdit(plot as PlotItem)}
                  className="text-xs text-primary hover:underline font-medium">แก้ไข</button>
                <button onClick={() => { if (confirm("ต้องการลบแปลงนี้?")) deletePlot.mutate({ id: plot.id }); }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors">ลบ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
