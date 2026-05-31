import { useState } from "react";
import {
  useListPlots,
  useCreatePlot,
  useUpdatePlot,
  useDeletePlot,
} from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber, VARIETIES } from "@/lib/utils";

type PlotItem = {
  id: number;
  name: string;
  areRai: number;
  treeCount: number;
  variety: string;
  treeAge: number;
  plantedDate: string;
  notes?: string | null;
  status: string;
  density: number;
};

const statusColor: Record<string, string> = {
  "ยังไม่ให้ผล": "bg-amber-100 text-amber-700",
  "เริ่มให้ผลน้อย": "bg-blue-100 text-blue-700",
  "ให้ผลเต็มที่": "bg-emerald-100 text-emerald-700",
};

const OPTIMAL_DENSITY: Record<string, string> = {
  "หมอนทอง": "16–20 ต้น/ไร่",
  "ชะนี": "20–25 ต้น/ไร่",
  default: "16–25 ต้น/ไร่",
};

function emptyForm() {
  return {
    name: "",
    areRai: "",
    treeCount: "",
    variety: VARIETIES[0],
    treeAge: "",
    plantedDate: "",
    notes: "",
  };
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
    setForm({
      name: plot.name,
      areRai: String(plot.areRai),
      treeCount: String(plot.treeCount),
      variety: plot.variety,
      treeAge: String(plot.treeAge),
      plantedDate: plot.plantedDate,
      notes: plot.notes ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name,
      areRai: parseFloat(form.areRai),
      treeCount: parseInt(form.treeCount),
      variety: form.variety,
      treeAge: parseInt(form.treeAge),
      plantedDate: form.plantedDate,
      notes: form.notes || undefined,
    };
    if (editId !== null) {
      updatePlot.mutate({ id: editId, data });
    } else {
      createPlot.mutate({ data });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ข้อมูลแปลง</h1>
          <p className="text-sm text-muted-foreground mt-0.5">จัดการข้อมูลแปลงทุเรียนทุกแปลง</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          {showForm && editId === null ? "ยกเลิก" : "+ เพิ่มแปลง"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">{editId ? "แก้ไขข้อมูลแปลง" : "เพิ่มแปลงใหม่"}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  placeholder={placeholder}
                  required={key !== "notes"}
                  min={type === "number" ? "0" : undefined}
                  step={key === "areRai" ? "0.1" : undefined}
                />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground font-medium">สายพันธุ์</label>
              <select
                value={form.variety}
                onChange={(e) => setForm({ ...form, variety: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              >
                {VARIETIES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }}
              className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
              ยกเลิก
            </button>
            <button type="submit" disabled={createPlot.isPending || updatePlot.isPending}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              {(createPlot.isPending || updatePlot.isPending) ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : plots.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">ยังไม่มีข้อมูลแปลง — กดปุ่ม "เพิ่มแปลง" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {plots.map((plot) => (
            <div key={plot.id} className="bg-card border border-border rounded-xl p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{plot.name}</h3>
                  <p className="text-sm text-muted-foreground">{plot.variety}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColor[plot.status] ?? "bg-muted text-muted-foreground"}`}>
                  {plot.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">พื้นที่</span>
                  <span className="font-medium text-foreground">{plot.areRai} ไร่</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">จำนวนต้น</span>
                  <span className="font-medium text-foreground">{formatNumber(plot.treeCount)} ต้น</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">อายุต้น</span>
                  <span className="font-medium text-foreground">{plot.treeAge} ปี</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">ความหนาแน่น</span>
                  <span className="font-medium text-foreground">{plot.density} ต้น/ไร่</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                ความหนาแน่นแนะนำ: {OPTIMAL_DENSITY[plot.variety] ?? OPTIMAL_DENSITY.default}
              </div>
              {plot.notes && <p className="text-xs text-muted-foreground italic">{plot.notes}</p>}
              <div className="flex gap-2 pt-1 border-t border-border">
                <button onClick={() => startEdit(plot as PlotItem)}
                  className="text-xs text-primary hover:underline">แก้ไข</button>
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
