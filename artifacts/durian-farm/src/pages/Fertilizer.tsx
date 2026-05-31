import { useState } from "react";
import { useCalculateFertilizer, useListPlots } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, STAGE_NAMES } from "@/lib/utils";

type FertilizerItem = { name: string; unit: string; quantityPerRai: number; totalQuantity: number; estimatedCostPerUnit: number; totalCost: number; };

const stageIcons = ["🌸", "🍃", "🌰", "✨"];
const stageBgs = [
  "from-pink-50 to-rose-50 border-pink-200/60",
  "from-green-50 to-teal-50 border-green-200/60",
  "from-amber-50 to-yellow-50 border-amber-200/60",
  "from-violet-50 to-purple-50 border-violet-200/60",
];

export default function Fertilizer() {
  const { data: plots = [] } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });
  const [plotId, setPlotId] = useState("");
  const [stage, setStage] = useState(1);
  const [manualAre, setManualAre] = useState("");
  const [manualTrees, setManualTrees] = useState("");
  const calculate = useCalculateFertilizer();
  const selectedPlot = plots.find((p) => String(p.id) === plotId);
  const areRai = selectedPlot ? selectedPlot.areRai : parseFloat(manualAre) || 0;
  const treeCount = selectedPlot ? selectedPlot.treeCount : parseInt(manualTrees) || 0;

  function handleCalculate() {
    if (!areRai || !treeCount) return;
    calculate.mutate({ data: { areRai, treeCount, stage, variety: selectedPlot?.variety } });
  }

  const plan = calculate.data;
  const inputCls = "border border-border/60 rounded-xl px-3 py-2 text-sm bg-white/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  function ItemTable({ items, title, color }: { items: FertilizerItem[]; title: string; color: string }) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2.5">{title}</h3>
        <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm bg-white/80">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/20">
              <tr>
                <th className="px-4 py-3 text-left">รายการ</th>
                <th className="px-4 py-3 text-right">ต่อไร่</th>
                <th className="px-4 py-3 text-right">จำนวนรวม</th>
                <th className="px-4 py-3 text-right">ราคา/หน่วย</th>
                <th className="px-4 py-3 text-right">ค่าใช้จ่าย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((item) => (
                <tr key={item.name} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-foreground font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{item.quantityPerRai} {item.unit}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatNumber(item.totalQuantity)} {item.unit}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatBaht(item.estimatedCostPerUnit)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${color}`}>{formatBaht(item.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">⚗️ คำนวณปุ๋ย/ยา AI</h1>
        <p className="text-sm text-muted-foreground mt-0.5">คำนวณปริมาณและต้นทุนปุ๋ย สารเคมี ตามช่วงการเจริญเติบโต</p>
      </div>

      <div className="bg-white/90 border border-border/50 rounded-2xl p-5 space-y-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">ข้อมูลแปลง</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">เลือกแปลง (หรือกรอกเอง)</label>
            <select value={plotId} onChange={(e) => setPlotId(e.target.value)} className={inputCls}>
              <option value="">กรอกข้อมูลเอง</option>
              {plots.map((p) => <option key={p.id} value={String(p.id)}>{p.name} ({p.areRai} ไร่, {p.treeCount} ต้น)</option>)}
            </select>
          </div>
          {!selectedPlot ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">พื้นที่ (ไร่)</label>
                <input type="number" min="0.1" step="0.1" value={manualAre} onChange={(e) => setManualAre(e.target.value)} className={inputCls} placeholder="เช่น 5" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">จำนวนต้น</label>
                <input type="number" min="1" value={manualTrees} onChange={(e) => setManualTrees(e.target.value)} className={inputCls} placeholder="เช่น 100" />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 text-sm px-4 py-3 bg-muted/20 rounded-xl border border-border/40">
              <span className="text-muted-foreground">พื้นที่: <strong className="text-foreground">{selectedPlot.areRai} ไร่</strong></span>
              <span className="text-muted-foreground">จำนวนต้น: <strong className="text-foreground">{selectedPlot.treeCount} ต้น</strong></span>
              <span className="text-muted-foreground">พันธุ์: <strong className="text-foreground">{selectedPlot.variety}</strong></span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground font-medium">ช่วงการเจริญเติบโต</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STAGE_NAMES.map((name, i) => (
              <button key={i} type="button" onClick={() => setStage(i + 1)}
                className={`text-left px-3 py-3 rounded-xl border text-sm transition-all ${stage === i + 1
                  ? `bg-gradient-to-br ${stageBgs[i]} shadow-sm font-semibold`
                  : "border-border/50 bg-white/60 text-muted-foreground hover:bg-white hover:border-border"
                }`}>
                <span className="text-base mr-1">{stageIcons[i]}</span>
                <span className="text-[11px] text-muted-foreground">ระยะ {i + 1}</span>
                <p className="text-xs font-medium text-foreground mt-0.5 leading-tight">{name}</p>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleCalculate} disabled={calculate.isPending || !areRai || !treeCount}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50 w-full md:w-auto">
          {calculate.isPending ? "⏳ กำลังคำนวณ..." : "✨ คำนวณปุ๋ยและยา"}
        </button>
      </div>

      {plan && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-primary/10 to-teal-50 border border-primary/20 rounded-2xl px-5 py-4">
            <h2 className="text-base font-bold text-foreground">{plan.stageName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">คำนวณสำหรับพื้นที่ {areRai} ไร่ | {treeCount} ต้น</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "ค่าปุ๋ยรวม", value: plan.totalFertilizerCost, icon: "🌿", bg: "from-green-50 to-teal-50", border: "border-green-200/50", color: "text-green-700" },
              { label: "ค่ายา/ฮอร์โมนรวม", value: plan.totalPesticideCost, icon: "⚗️", bg: "from-violet-50 to-purple-50", border: "border-violet-200/50", color: "text-violet-700" },
              { label: "ต้นทุน/ไร่", value: plan.costPerRai, icon: "📐", bg: "from-amber-50 to-yellow-50", border: "border-amber-200/50", color: "text-amber-700" },
              { label: "ต้นทุน/ต้น", value: plan.costPerTree, icon: "🌳", bg: "from-sky-50 to-blue-50", border: "border-sky-200/50", color: "text-sky-700" },
            ].map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                  <span className="text-base">{s.icon}</span>
                </div>
                <p className={`text-lg font-bold ${s.color}`}>{formatBaht(s.value)}</p>
              </div>
            ))}
          </div>

          <ItemTable items={plan.fertilizers} title="🌿 รายการปุ๋ย" color="text-green-700" />
          <ItemTable items={plan.pesticides} title="⚗️ รายการยา/ฮอร์โมน/สารเคมี" color="text-violet-700" />

          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800">
            <span className="font-semibold">📌 หมายเหตุ:</span>{" "}
            ราคาเป็นราคาตลาดโดยประมาณ ปุ๋ยเม็ด 18–35 บาท/กก. | ยา/ฮอร์โมน 180–450 บาท/ลิตร
            ราคาจริงอาจแตกต่างกันตามท้องตลาดในแต่ละช่วงเวลา
          </div>
        </div>
      )}
    </div>
  );
}
