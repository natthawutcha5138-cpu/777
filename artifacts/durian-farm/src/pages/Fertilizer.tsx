import { useState } from "react";
import { useCalculateFertilizer, useListPlots } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, STAGE_NAMES } from "@/lib/utils";
import { Calculator, Sprout, FlaskConical, Beaker, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type FertilizerItem = { name: string; unit: string; quantityPerRai: number; totalQuantity: number; estimatedCostPerUnit: number; totalCost: number; };

const STAGE_ICONS = ["🌿", "🌸", "🍈", "🧺"];
const STAGE_COLORS = [
  { active: "border-green-500 bg-green-50 dark:bg-green-950/30",  dot: "bg-green-500",  text: "text-green-700 dark:text-green-400"  },
  { active: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",     dot: "bg-blue-500",   text: "text-blue-700 dark:text-blue-400"    },
  { active: "border-violet-500 bg-violet-50 dark:bg-violet-950/30",dot: "bg-violet-500",text: "text-violet-700 dark:text-violet-400" },
  { active: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",  dot: "bg-amber-500",  text: "text-amber-700 dark:text-amber-400"  },
];

function ItemTable({ items, title, icon }: { items: FertilizerItem[]; title: string; icon: React.ReactNode }) {
  return (
    <div className="card-premium overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
        {icon}
        <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <span className="ml-auto text-[11px] text-gray-400">{items.length} รายการ</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>รายการ</th>
              <th className="text-right">ต่อไร่</th>
              <th className="text-right">จำนวนรวม</th>
              <th className="text-right">ราคา/หน่วย</th>
              <th className="text-right">ค่าใช้จ่าย</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.name}>
                <td className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</td>
                <td className="text-right text-gray-400 text-[12px] num">{item.quantityPerRai} {item.unit}</td>
                <td className="text-right font-semibold text-gray-800 dark:text-gray-200 num tabular-nums">{formatNumber(item.totalQuantity)} {item.unit}</td>
                <td className="text-right text-gray-400 num tabular-nums text-[12px]">{formatBaht(item.estimatedCostPerUnit)}</td>
                <td className="text-right font-bold text-green-600 dark:text-green-400 num tabular-nums">{formatBaht(item.totalCost)}</td>
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
    <div className="max-w-5xl mx-auto space-y-5 pb-10">

      {/* ── Page Header ── */}
      <div className="relative h-28 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <img src="/images/durian-flower.jpg" alt="ดอกทุเรียน" className="w-full h-full object-cover object-[center_30%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/75 via-gray-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
              <Calculator className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-white tracking-tight">คำนวณปุ๋ยและยา</h1>
              <p className="text-[11px] text-white/60 mt-0.5">คำนวณปริมาณและต้นทุนตามช่วงการเจริญเติบโต</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Input Card ── */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="section-header-icon bg-green-50 dark:bg-green-950/40">
            <Sprout className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">ข้อมูลแปลง</h2>
        </div>

        {/* Plot selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">เลือกแปลง</label>
            <select value={plotId} onChange={(e) => setPlotId(e.target.value)} className="input-base">
              <option value="">กรอกข้อมูลเอง</option>
              {plots.map(p => <option key={p.id} value={String(p.id)}>{p.name} — {p.areRai} ไร่, {p.treeCount} ต้น</option>)}
            </select>
          </div>

          {!selected ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">พื้นที่ (ไร่)</label>
                <input type="number" min="0.1" step="0.1" value={manualAre} onChange={(e) => setManualAre(e.target.value)} className="input-base" placeholder="เช่น 5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">จำนวนต้น</label>
                <input type="number" min="1" value={manualTrees} onChange={(e) => setManualTrees(e.target.value)} className="input-base" placeholder="เช่น 100" />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-5 px-4 py-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900/50">
              <div>
                <p className="text-[10px] text-gray-400">พื้นที่</p>
                <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 num">{selected.areRai} ไร่</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">ต้น</p>
                <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 num">{selected.treeCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">พันธุ์</p>
                <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200">{selected.variety}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stage selector */}
        <div className="mb-6">
          <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-3">ช่วงการเจริญเติบโต</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {STAGE_NAMES.map((name, i) => {
              const sc = STAGE_COLORS[i]!;
              const active = stage === i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStage(i + 1)}
                  className={cn(
                    "text-left px-4 py-3 rounded-xl text-[13px] transition-all duration-150 border-2",
                    active
                      ? sc.active + " border-2"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">{STAGE_ICONS[i]}</span>
                    <span className={cn("text-[10px] font-semibold", active ? sc.text : "text-gray-400")}>ระยะที่ {i + 1}</span>
                  </div>
                  <p className="text-[12px] font-semibold leading-tight text-gray-800 dark:text-gray-200">{name}</p>
                  {active && (
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-2", sc.dot)} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculate button */}
        <button
          onClick={handleCalculate}
          disabled={calculate.isPending || !areRai || !treeCount}
          className="btn-primary disabled:opacity-50 py-2.5 px-8 text-[13px]"
        >
          <Calculator className="w-4 h-4" />
          {calculate.isPending ? "กำลังคำนวณ..." : "คำนวณปุ๋ยและยา"}
        </button>
      </div>

      {/* ── Results ── */}
      {plan && (
        <div className="space-y-5 fade-up">

          {/* Plan header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200 dark:border-green-900/40">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-green-800 dark:text-green-300">{plan.stageName}</h2>
              <p className="text-[12px] text-green-600 dark:text-green-500 mt-0.5">พื้นที่ {areRai} ไร่ · {treeCount} ต้น</p>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "ค่าปุ๋ยรวม",        val: plan.totalFertilizerCost, icon: "🌱", accentClass: "green"  },
              { label: "ค่ายา/ฮอร์โมนรวม",  val: plan.totalPesticideCost,  icon: "💊", accentClass: "blue"   },
              { label: "ต้นทุน/ไร่",          val: plan.costPerRai,          icon: "🗺️", accentClass: "amber"  },
              { label: "ต้นทุน/ต้น",          val: plan.costPerTree,         icon: "🌳", accentClass: "blue"   },
            ].map(s => (
              <div key={s.label} className={cn("stat-card", s.accentClass)}>
                <div className="text-xl mb-3">{s.icon}</div>
                <p className="text-[11px] font-medium text-gray-400 mb-1">{s.label}</p>
                <p className="text-[18px] font-extrabold text-gray-900 dark:text-white num tabular-nums">{formatBaht(s.val)}</p>
              </div>
            ))}
          </div>

          <ItemTable
            items={plan.fertilizers}
            title="รายการปุ๋ย"
            icon={<div className="w-7 h-7 bg-green-100 dark:bg-green-950/40 rounded-lg flex items-center justify-center"><Sprout className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /></div>}
          />
          <ItemTable
            items={plan.pesticides}
            title="รายการยา / ฮอร์โมน / สารเคมี"
            icon={<div className="w-7 h-7 bg-blue-100 dark:bg-blue-950/40 rounded-lg flex items-center justify-center"><FlaskConical className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /></div>}
          />

          <div className="flex gap-3 items-start px-4 py-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
            <Beaker className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
              ราคาเป็นราคาตลาดโดยประมาณ · ปุ๋ยเม็ด 18–35 บาท/กก. · ยา/ฮอร์โมน 180–450 บาท/ลิตร · ราคาจริงอาจแตกต่างตามท้องตลาด
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
