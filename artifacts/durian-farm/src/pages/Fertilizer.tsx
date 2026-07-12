import { useState } from "react";
import { useCalculateFertilizer, useListPlots } from "@workspace/api-client-react";
import { getListPlotsQueryKey } from "@workspace/api-client-react";
import { formatBaht, formatNumber, STAGE_NAMES } from "@/lib/utils";
import { Calculator, Sprout, FlaskConical, Beaker, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
    <div className="card-premium overflow-hidden fade-up">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        {icon}
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">{items.length} รายการ</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base w-full">
          <thead>
            <tr>
              <th className="min-w-[150px]">รายการ</th>
              <th className="text-right">ต่อไร่</th>
              <th className="text-right">จำนวนรวม</th>
              <th className="text-right">ราคา/หน่วย</th>
              <th className="text-right">ค่าใช้จ่ายรวม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {items.map((item, idx) => (
              <tr key={item.name} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms`}}>
                <td className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.name}</td>
                <td className="text-right text-gray-500 dark:text-gray-400 text-xs num">{item.quantityPerRai} {item.unit}</td>
                <td className="text-right font-bold text-gray-800 dark:text-gray-200 text-sm num tabular-nums">{formatNumber(item.totalQuantity)} <span className="text-xs text-gray-500 font-normal">{item.unit}</span></td>
                <td className="text-right text-gray-500 dark:text-gray-400 num tabular-nums text-xs">{formatBaht(item.estimatedCostPerUnit)}</td>
                <td className="text-right font-bold text-green-600 dark:text-green-400 text-sm num tabular-nums">{formatBaht(item.totalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Fertilizer() {
  const { toast } = useToast();
  const { data: plots = [] } = useListPlots({ query: { queryKey: getListPlotsQueryKey() } });
  const [plotId,      setPlotId]      = useState("");
  const [stage,       setStage]       = useState(1);
  const [manualAre,   setManualAre]   = useState("");
  const [manualTrees, setManualTrees] = useState("");
  
  const calculate = useCalculateFertilizer({
    mutation: {
      onSuccess: () => {
        toast({ title: "คำนวณสำเร็จ", description: "ระบบประมวลผลปริมาณปุ๋ยและยาเรียบร้อยแล้ว" });
      },
      onError: () => {
        toast({ title: "คำนวณล้มเหลว", description: "เกิดข้อผิดพลาดในการคำนวณ โปรดลองอีกครั้ง", variant: "destructive" });
      }
    }
  });

  const selected  = plots.find(p => String(p.id) === plotId);
  const areRai    = selected ? selected.areRai    : parseFloat(manualAre)   || 0;
  const treeCount = selected ? selected.treeCount : parseInt(manualTrees)   || 0;

  function handleCalculate() {
    if (!areRai || !treeCount) {
      toast({ title: "ข้อมูลไม่ครบถ้วน", description: "โปรดระบุพื้นที่ (ไร่) และจำนวนต้นก่อนคำนวณ", variant: "destructive" });
      return;
    }
    calculate.mutate({ data: { areRai, treeCount, stage, variety: selected?.variety } });
  }

  const plan = calculate.data;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 page-enter stagger">

      {/* ── Page Header ── */}
      <div className="relative h-32 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <img src="/images/durian-flower.jpg" alt="ดอกทุเรียน" className="w-full h-full object-cover object-[center_30%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">คำนวณปุ๋ยและยา</h1>
              <p className="text-sm text-white/70 mt-1">ประเมินปริมาณและต้นทุนที่เหมาะสมตามช่วงการเจริญเติบโต</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Input Card ── */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="section-header-icon bg-green-50 dark:bg-green-950/40 w-10 h-10">
            <Sprout className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">ข้อมูลแปลง</h2>
            <p className="text-xs text-gray-500">เลือกจากแปลงที่มีอยู่หรือกรอกข้อมูลเอง</p>
          </div>
        </div>

        {/* Plot selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">เลือกแปลงอ้างอิง</label>
            <select value={plotId} onChange={(e) => setPlotId(e.target.value)} className="input-base cursor-pointer">
              <option value="">-- กำหนดข้อมูลเอง --</option>
              {plots.map(p => <option key={p.id} value={String(p.id)}>{p.name} ({p.areRai} ไร่ · {p.treeCount} ต้น)</option>)}
            </select>
          </div>

          {!selected ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">พื้นที่ (ไร่) <span className="text-red-500">*</span></label>
                <input type="number" min="0.1" step="0.1" value={manualAre} onChange={(e) => setManualAre(e.target.value)} className="input-base font-medium num" placeholder="เช่น 5" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">จำนวนต้น <span className="text-red-500">*</span></label>
                <input type="number" min="1" value={manualTrees} onChange={(e) => setManualTrees(e.target.value)} className="input-base font-medium num" placeholder="เช่น 100" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 px-5 py-3.5 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-200/60 dark:border-green-900/40">
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">พื้นที่</p>
                <p className="text-base font-bold text-gray-900 dark:text-white num">{selected.areRai} ไร่</p>
              </div>
              <div className="w-px h-8 bg-green-200/50 dark:bg-green-800/50 hidden sm:block"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">จำนวน</p>
                <p className="text-base font-bold text-gray-900 dark:text-white num">{selected.treeCount} ต้น</p>
              </div>
              <div className="w-px h-8 bg-green-200/50 dark:bg-green-800/50 hidden sm:block"></div>
              <div className="flex-1 hidden sm:block">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">สายพันธุ์</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{selected.variety}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stage selector */}
        <div className="mb-8 border-t border-gray-100 dark:border-gray-800/60 pt-6">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-4">ระบุช่วงการเจริญเติบโตปัจจุบัน</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STAGE_NAMES.map((name, i) => {
              const sc = STAGE_COLORS[i]!;
              const active = stage === i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStage(i + 1)}
                  className={cn(
                    "text-left px-4 py-4 rounded-xl text-sm transition-all duration-200 border-2 relative overflow-hidden group focus-ring",
                    active
                      ? sc.active + " border-2 shadow-sm transform scale-[1.02]"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl group-hover:scale-110 transition-transform">{STAGE_ICONS[i]}</span>
                    <span className={cn("text-xs font-bold uppercase tracking-wider", active ? sc.text : "text-gray-400")}>ระยะ {i + 1}</span>
                  </div>
                  <p className={cn("text-sm font-bold leading-tight", active ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>{name}</p>
                  {active && (
                    <div className={cn("absolute top-4 right-4 w-2 h-2 rounded-full", sc.dot)} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculate button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleCalculate}
            disabled={calculate.isPending || !areRai || !treeCount}
            className="btn-primary disabled:opacity-50 py-3 px-8 text-sm shadow-sm"
          >
            {calculate.isPending ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> กำลังประมวลผล...</span>
            ) : (
              <span className="flex items-center gap-2"><Calculator className="w-4 h-4" /> เริ่มการคำนวณ</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {plan && (
        <div className="space-y-6 fade-up">
          {/* Plan header */}
          <div className="flex items-center gap-4 px-6 py-5 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200/80 dark:border-green-900/40 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shrink-0 shadow-sm z-10">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
            <div className="z-10">
              <h2 className="text-lg font-bold text-green-900 dark:text-green-100">{plan.stageName}</h2>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1 font-medium">สำหรับพื้นที่ {areRai} ไร่ · จำนวน {treeCount} ต้น</p>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[
              { label: "ค่าปุ๋ยรวม",        val: plan.totalFertilizerCost, icon: "🌱", accentClass: "green"  },
              { label: "ค่ายา/ฮอร์โมนรวม",  val: plan.totalPesticideCost,  icon: "💊", accentClass: "blue"   },
              { label: "ต้นทุนเฉลี่ย / ไร่",  val: plan.costPerRai,          icon: "🗺️", accentClass: "amber"  },
              { label: "ต้นทุนเฉลี่ย / ต้น",  val: plan.costPerTree,         icon: "🌳", accentClass: "blue"   },
            ].map((s, idx) => (
              <div key={s.label} className={cn("stat-card flex flex-col items-start fade-up", s.accentClass)} style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl mb-4 border border-gray-100 dark:border-gray-700">{s.icon}</div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{s.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white num tabular-nums leading-none mt-auto">{formatBaht(s.val)}</p>
              </div>
            ))}
          </div>

          <ItemTable
            items={plan.fertilizers}
            title="รายการปุ๋ยที่ต้องใช้"
            icon={<div className="w-8 h-8 bg-green-100 dark:bg-green-950/40 rounded-xl flex items-center justify-center"><Sprout className="w-4 h-4 text-green-600 dark:text-green-400" /></div>}
          />
          
          <ItemTable
            items={plan.pesticides}
            title="รายการยา / ฮอร์โมน / สารเคมีที่ต้องใช้"
            icon={<div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/40 rounded-xl flex items-center justify-center"><FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>}
          />

          <div className="flex gap-4 items-start px-5 py-4 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">หมายเหตุราคาประเมิน</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed max-w-3xl">
                ราคาเป็นราคาตลาดโดยประมาณที่อ้างอิงจากข้อมูลกลาง · ปุ๋ยเม็ด 18–35 บาท/กก. · ยา/ฮอร์โมน 180–450 บาท/ลิตร · ราคาจริงอาจแตกต่างตามแบรนด์ที่เลือกใช้และท้องตลาดในแต่ละพื้นที่
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
