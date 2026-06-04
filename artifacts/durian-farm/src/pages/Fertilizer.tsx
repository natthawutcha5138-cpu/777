import { useState } from "react";
import { useCalculateFertilizer, useListPlots } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, STAGE_NAMES } from "@/lib/utils";
import { Calculator, Sprout, FlaskConical, Beaker } from "lucide-react";

type FertilizerItem = { name: string; unit: string; quantityPerRai: number; totalQuantity: number; estimatedCostPerUnit: number; totalCost: number; };

const inputCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:bg-white transition-all w-full";

const stageColors = [
  "from-emerald-400 to-green-500",
  "from-blue-400 to-cyan-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
];

function ItemTable({ items, title, icon }: { items: FertilizerItem[]; title: string; icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">รายการ</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">ต่อไร่</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">จำนวนรวม</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">ราคา/หน่วย</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">ค่าใช้จ่าย</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(item => (
              <tr key={item.name} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3.5 font-semibold text-gray-800">{item.name}</td>
                <td className="px-4 py-3.5 text-right text-gray-500 text-xs">{item.quantityPerRai} {item.unit}</td>
                <td className="px-4 py-3.5 text-right font-bold text-gray-800 tabular-nums">{formatNumber(item.totalQuantity)} {item.unit}</td>
                <td className="px-4 py-3.5 text-right text-gray-500 tabular-nums text-xs">{formatBaht(item.estimatedCostPerUnit)}</td>
                <td className="px-4 py-3.5 text-right font-bold text-green-600 tabular-nums">{formatBaht(item.totalCost)}</td>
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
    <div className="space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-200">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">คำนวณปุ๋ยและยา</h1>
          <p className="text-xs text-gray-400 mt-0.5">คำนวณปริมาณและต้นทุนตามช่วงการเจริญเติบโต</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <Sprout className="w-4 h-4 text-green-600" />
          <h2 className="text-sm font-bold text-gray-800">ข้อมูลแปลง</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">เลือกแปลง (หรือกรอกเอง)</label>
            <select value={plotId} onChange={(e) => setPlotId(e.target.value)} className={inputCls}>
              <option value="">กรอกข้อมูลเอง</option>
              {plots.map(p => <option key={p.id} value={String(p.id)}>{p.name} — {p.areRai} ไร่, {p.treeCount} ต้น</option>)}
            </select>
          </div>
          {!selected ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">พื้นที่ (ไร่)</label>
                <input type="number" min="0.1" step="0.1" value={manualAre} onChange={(e) => setManualAre(e.target.value)} className={inputCls} placeholder="เช่น 5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">จำนวนต้น</label>
                <input type="number" min="1" value={manualTrees} onChange={(e) => setManualTrees(e.target.value)} className={inputCls} placeholder="เช่น 100" />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-5 px-4 py-3 bg-green-50 rounded-2xl border border-green-100">
              <span><span className="text-xs text-gray-500">พื้นที่: </span><strong className="text-sm text-gray-800">{selected.areRai} ไร่</strong></span>
              <span><span className="text-xs text-gray-500">ต้น: </span><strong className="text-sm text-gray-800">{selected.treeCount} ต้น</strong></span>
              <span><span className="text-xs text-gray-500">พันธุ์: </span><strong className="text-sm text-gray-800">{selected.variety}</strong></span>
            </div>
          )}
        </div>

        {/* Stage selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 block mb-3">ช่วงการเจริญเติบโต</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {STAGE_NAMES.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStage(i + 1)}
                className={`relative text-left px-4 py-3 rounded-2xl text-sm transition-all overflow-hidden ${
                  stage === i + 1
                    ? `bg-gradient-to-br ${stageColors[i]} text-white shadow-lg`
                    : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50"
                }`}
              >
                <span className={`text-[10px] block mb-0.5 font-medium ${stage === i + 1 ? "text-white/70" : "text-gray-400"}`}>ระยะที่ {i + 1}</span>
                <span className="text-sm font-semibold leading-tight">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={calculate.isPending || !areRai || !treeCount}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl hover:from-green-600 hover:to-emerald-700 shadow-md shadow-green-200 transition-all disabled:opacity-50"
        >
          <Calculator className="w-4 h-4" />
          {calculate.isPending ? "กำลังคำนวณ..." : "คำนวณปุ๋ยและยา"}
        </button>
      </div>

      {/* Results */}
      {plan && (
        <div className="space-y-5">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl px-5 py-4 border border-green-100">
            <h2 className="text-base font-bold text-green-800">{plan.stageName}</h2>
            <p className="text-sm text-green-600 mt-0.5">พื้นที่ {areRai} ไร่ · {treeCount} ต้น</p>
          </div>

          {/* Cost Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "ค่าปุ๋ยรวม",        val: plan.totalFertilizerCost, bg: "from-green-50 to-emerald-100",  emoji: "🌱" },
              { label: "ค่ายา/ฮอร์โมนรวม",  val: plan.totalPesticideCost,  bg: "from-blue-50 to-sky-100",       emoji: "💊" },
              { label: "ต้นทุน/ไร่",          val: plan.costPerRai,          bg: "from-violet-50 to-purple-100",  emoji: "🗺️" },
              { label: "ต้นทุน/ต้น",          val: plan.costPerTree,         bg: "from-amber-50 to-yellow-100",   emoji: "🌳" },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} rounded-3xl p-5 shadow-sm`}>
                <div className="text-2xl mb-2">{s.emoji}</div>
                <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                <p className="text-xl font-bold text-green-700 tabular-nums">{formatBaht(s.val)}</p>
              </div>
            ))}
          </div>

          <ItemTable
            items={plan.fertilizers}
            title="รายการปุ๋ย"
            icon={<div className="w-7 h-7 bg-green-100 rounded-xl flex items-center justify-center"><Sprout className="w-3.5 h-3.5 text-green-600" /></div>}
          />
          <ItemTable
            items={plan.pesticides}
            title="รายการยา / ฮอร์โมน / สารเคมี"
            icon={<div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center"><FlaskConical className="w-3.5 h-3.5 text-blue-600" /></div>}
          />

          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3.5 flex gap-3 items-start">
            <Beaker className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              ราคาเป็นราคาตลาดโดยประมาณ ปุ๋ยเม็ด 18–35 บาท/กก. ยา/ฮอร์โมน 180–450 บาท/ลิตร ราคาจริงอาจแตกต่างตามท้องตลาด
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
