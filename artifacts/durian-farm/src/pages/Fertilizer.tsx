import { useState } from "react";
import { useCalculateFertilizer, useListPlots } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, STAGE_NAMES } from "@/lib/utils";

type FertilizerItem = {
  name: string;
  unit: string;
  quantityPerRai: number;
  totalQuantity: number;
  estimatedCostPerUnit: number;
  totalCost: number;
};

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
    calculate.mutate({
      data: {
        areRai,
        treeCount,
        stage,
        variety: selectedPlot?.variety,
      },
    });
  }

  const plan = calculate.data;

  function ItemTable({ items, title }: { items: FertilizerItem[]; title: string }) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">รายการ</th>
                <th className="px-4 py-2.5 text-right">ต่อไร่</th>
                <th className="px-4 py-2.5 text-right">จำนวนรวม</th>
                <th className="px-4 py-2.5 text-right">ราคา/หน่วย</th>
                <th className="px-4 py-2.5 text-right">ค่าใช้จ่าย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.name} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {item.quantityPerRai} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatNumber(item.totalQuantity)} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatBaht(item.estimatedCostPerUnit)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">
                    {formatBaht(item.totalCost)}
                  </td>
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
        <h1 className="text-2xl font-bold text-foreground">คำนวณปุ๋ย/ยา AI</h1>
        <p className="text-sm text-muted-foreground mt-0.5">คำนวณปริมาณและต้นทุนปุ๋ย สารเคมี ตามช่วงการเจริญเติบโต</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">ข้อมูลแปลง</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">เลือกแปลง (หรือกรอกเอง)</label>
            <select
              value={plotId}
              onChange={(e) => setPlotId(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              <option value="">กรอกข้อมูลเอง</option>
              {plots.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name} ({p.areRai} ไร่, {p.treeCount} ต้น)
                </option>
              ))}
            </select>
          </div>

          {!selectedPlot && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">พื้นที่ (ไร่)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={manualAre}
                  onChange={(e) => setManualAre(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  placeholder="เช่น 5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground font-medium">จำนวนต้น</label>
                <input
                  type="number"
                  min="1"
                  value={manualTrees}
                  onChange={(e) => setManualTrees(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  placeholder="เช่น 100"
                />
              </div>
            </>
          )}
          {selectedPlot && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">พื้นที่: <strong className="text-foreground">{selectedPlot.areRai} ไร่</strong></span>
              <span className="text-muted-foreground">จำนวนต้น: <strong className="text-foreground">{selectedPlot.treeCount} ต้น</strong></span>
              <span className="text-muted-foreground">พันธุ์: <strong className="text-foreground">{selectedPlot.variety}</strong></span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">ช่วงการเจริญเติบโต</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {STAGE_NAMES.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStage(i + 1)}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                  stage === i + 1
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-xs font-bold mr-1">ระยะ {i + 1}</span> {name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={calculate.isPending || !areRai || !treeCount}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {calculate.isPending ? "กำลังคำนวณ..." : "คำนวณ"}
        </button>
      </div>

      {plan && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-1">
            <h2 className="text-base font-bold text-foreground">{plan.stageName}</h2>
            <p className="text-sm text-muted-foreground">
              คำนวณสำหรับพื้นที่ {areRai} ไร่ | {treeCount} ต้น
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-xs text-muted-foreground">ค่าปุ๋ยรวม</span>
              <p className="text-lg font-bold text-primary mt-1">{formatBaht(plan.totalFertilizerCost)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-xs text-muted-foreground">ค่ายา/ฮอร์โมนรวม</span>
              <p className="text-lg font-bold text-primary mt-1">{formatBaht(plan.totalPesticideCost)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-xs text-muted-foreground">ต้นทุน/ไร่</span>
              <p className="text-lg font-bold text-foreground mt-1">{formatBaht(plan.costPerRai)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <span className="text-xs text-muted-foreground">ต้นทุน/ต้น</span>
              <p className="text-lg font-bold text-foreground mt-1">{formatBaht(plan.costPerTree)}</p>
            </div>
          </div>

          <ItemTable items={plan.fertilizers} title="รายการปุ๋ย" />
          <ItemTable items={plan.pesticides} title="รายการยา/ฮอร์โมน/สารเคมี" />

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <span className="font-semibold">หมายเหตุ:</span>{" "}
            ราคาเป็นราคาตลาดโดยประมาณ ปุ๋ยเม็ด 18–35 บาท/กก. | ยา/ฮอร์โมน 180–450 บาท/ลิตร
            ราคาจริงอาจแตกต่างกันตามท้องตลาดในแต่ละช่วงเวลา
          </div>
        </div>
      )}
    </div>
  );
}
