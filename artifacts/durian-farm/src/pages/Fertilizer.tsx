import { useState } from "react";
import { useCalculateFertilizer, useListPlots } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, STAGE_NAMES } from "@/lib/utils";

type FertilizerItem = { name: string; unit: string; quantityPerRai: number; totalQuantity: number; estimatedCostPerUnit: number; totalCost: number; };

const inputCls = "border border-border rounded px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-full";

function ItemTable({ items, title }: { items: FertilizerItem[]; title: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <div className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium">รายการ</th>
              <th className="px-4 py-3 text-right font-medium">ต่อไร่</th>
              <th className="px-4 py-3 text-right font-medium">จำนวนรวม</th>
              <th className="px-4 py-3 text-right font-medium">ราคา/หน่วย</th>
              <th className="px-4 py-3 text-right font-medium">ค่าใช้จ่าย</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map(item => (
              <tr key={item.name} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.quantityPerRai} {item.unit}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground tabular-nums">{formatNumber(item.totalQuantity)} {item.unit}</td>
                <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{formatBaht(item.estimatedCostPerUnit)}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary tabular-nums">{formatBaht(item.totalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Fertilizer() {
  const { data: plots = [] } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });
  const [plotId,      setPlotId]      = useState("");
  const [stage,       setStage]       = useState(1);
  const [manualAre,   setManualAre]   = useState("");
  const [manualTrees, setManualTrees] = useState("");
  const calculate = useCalculateFertilizer();

  const selected  = plots.find(p => String(p.id) === plotId);
  const areRai    = selected ? selected.areRai    : parseFloat(manualAre)   || 0;
  const treeCount = selected ? selected.treeCount : parseInt(manualTrees)   || 0;

  function handleCalculate() {
    if (!areRai || !treeCount) return;
    calculate.mutate({ data: { areRai, treeCount, stage, variety: selected?.variety } });
  }

  const plan = calculate.data;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">คำนวณปุ๋ยและยา</h1>
        <p className="text-sm text-muted-foreground mt-0.5">คำนวณปริมาณและต้นทุนตามช่วงการเจริญเติบโต</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-foreground mb-4 pb-3 border-b border-border">ข้อมูลแปลง</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">เลือกแปลง (หรือกรอกเอง)</label>
            <select value={plotId} onChange={(e) => setPlotId(e.target.value)} className={inputCls}>
              <option value="">กรอกข้อมูลเอง</option>
              {plots.map(p => <option key={p.id} value={String(p.id)}>{p.name} — {p.areRai} ไร่, {p.treeCount} ต้น</option>)}
            </select>
          </div>
          {!selected ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">พื้นที่ (ไร่)</label>
                <input type="number" min="0.1" step="0.1" value={manualAre} onChange={(e) => setManualAre(e.target.value)} className={inputCls} placeholder="เช่น 5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">จำนวนต้น</label>
                <input type="number" min="1" value={manualTrees} onChange={(e) => setManualTrees(e.target.value)} className={inputCls} placeholder="เช่น 100" />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-6 text-sm px-3 py-2 bg-muted/40 rounded border border-border">
              <span><span className="text-muted-foreground">พื้นที่:</span> <strong>{selected.areRai} ไร่</strong></span>
              <span><span className="text-muted-foreground">ต้น:</span> <strong>{selected.treeCount} ต้น</strong></span>
              <span><span className="text-muted-foreground">พันธุ์:</span> <strong>{selected.variety}</strong></span>
            </div>
          )}
        </div>

        <div className="mb-5">
          <label className="text-xs font-medium text-muted-foreground block mb-2">ช่วงการเจริญเติบโต</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STAGE_NAMES.map((name, i) => (
              <button key={i} type="button" onClick={() => setStage(i + 1)}
                className={`text-left px-3.5 py-3 rounded border text-sm transition-all ${stage === i + 1
                  ? "border-primary bg-primary/5 text-primary font-semibold"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30"
                }`}>
                <span className="text-xs text-muted-foreground block mb-0.5">ระยะที่ {i + 1}</span>
                <span className="leading-tight">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleCalculate} disabled={calculate.isPending || !areRai || !treeCount}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50">
          {calculate.isPending ? "กำลังคำนวณ..." : "คำนวณปุ๋ยและยา"}
        </button>
      </div>

      {plan && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-lg px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">{plan.stageName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">พื้นที่ {areRai} ไร่ · {treeCount} ต้น</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "ค่าปุ๋ยรวม",       val: plan.totalFertilizerCost },
              { label: "ค่ายา/ฮอร์โมนรวม", val: plan.totalPesticideCost },
              { label: "ต้นทุน/ไร่",        val: plan.costPerRai },
              { label: "ต้นทุน/ต้น",        val: plan.costPerTree },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-lg p-4 shadow-xs">
                <p className="text-xs text-muted-foreground font-medium mb-1.5">{s.label}</p>
                <p className="text-lg font-semibold text-primary tabular-nums">{formatBaht(s.val)}</p>
              </div>
            ))}
          </div>

          <ItemTable items={plan.fertilizers} title="รายการปุ๋ย" />
          <ItemTable items={plan.pesticides}  title="รายการยา / ฮอร์โมน / สารเคมี" />

          <div className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-4 py-3">
            หมายเหตุ: ราคาเป็นราคาตลาดโดยประมาณ ปุ๋ยเม็ด 18–35 บาท/กก. ยา/ฮอร์โมน 180–450 บาท/ลิตร ราคาจริงอาจแตกต่างตามท้องตลาด
          </div>
        </div>
      )}
    </div>
  );
}
