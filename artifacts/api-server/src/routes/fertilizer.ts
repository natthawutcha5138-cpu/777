// @ts-nocheck
import { Router, type IRouter } from "express";
import { CalculateFertilizerBody, CalculateFertilizerResponse } from "@workspace/api-zod";

const router: IRouter = Router();

type FertilizerItem = {
  name: string;
  unit: string;
  quantityPerRai: number;
  totalQuantity: number;
  estimatedCostPerUnit: number;
  totalCost: number;
};

const STAGES = [
  {
    stage: 1,
    stageName: "เตรียมออกดอก (ต.ค.–ธ.ค.)",
    fertilizers: [
      { name: "ปุ๋ยสูตร 8-24-24", unit: "กก.", quantityPerRai: 25, costPerUnit: 25 },
      { name: "ปุ๋ยโปแตสเซียม (0-0-60)", unit: "กก.", quantityPerRai: 10, costPerUnit: 30 },
      { name: "แคลเซียม-โบรอน", unit: "ลิตร", quantityPerRai: 3, costPerUnit: 350 },
    ],
    pesticides: [
      { name: "ฮอร์โมนไทโอยูเรีย (กระตุ้นดอก)", unit: "มล./ตร.ม.", quantityPerRai: 2, costPerUnit: 0.2, perTree: true },
      { name: "ยาป้องกันราน้ำค้าง", unit: "ลิตร", quantityPerRai: 0.8, costPerUnit: 380 },
    ],
  },
  {
    stage: 2,
    stageName: "ออกดอก–ดูแลดอก (ม.ค.–ก.พ.)",
    fertilizers: [
      { name: "ปุ๋ยสูตร 15-15-15", unit: "กก.", quantityPerRai: 15, costPerUnit: 22 },
      { name: "ปุ๋ยไนโตรเจนทางใบ", unit: "ลิตร/ต้น", quantityPerRai: 0.2, costPerUnit: 250, perTree: true },
    ],
    pesticides: [
      { name: "ยาป้องกันเพลี้ยไฟ/ไร", unit: "ลิตร", quantityPerRai: 0.6, costPerUnit: 400 },
      { name: "สารป้องกันโรคดอกร่วง", unit: "ลิตร", quantityPerRai: 0.5, costPerUnit: 420 },
    ],
  },
  {
    stage: 3,
    stageName: "ติดผล–พัฒนาผล (มี.ค.–เม.ย.)",
    fertilizers: [
      { name: "ปุ๋ยสูตร 13-13-21", unit: "กก.", quantityPerRai: 30, costPerUnit: 28 },
      { name: "แคลเซียม-โบรอน (ลดผลแตก)", unit: "ลิตร", quantityPerRai: 4, costPerUnit: 350 },
      { name: "ธาตุอาหารรอง (Mg, Zn, Fe)", unit: "กก.", quantityPerRai: 2, costPerUnit: 120 },
    ],
    pesticides: [
      { name: "ยาฆ่าหนอนเจาะผล", unit: "ลิตร", quantityPerRai: 1.0, costPerUnit: 390 },
      { name: "ยาป้องกันราผลเน่า", unit: "ลิตร", quantityPerRai: 0.8, costPerUnit: 360 },
    ],
  },
  {
    stage: 4,
    stageName: "ก่อนเก็บเกี่ยว–หลังเก็บ (พ.ค.–มิ.ย.)",
    fertilizers: [
      { name: "ปุ๋ยโปแตสเซียมซัลเฟต (0-0-50)", unit: "กก.", quantityPerRai: 15, costPerUnit: 32 },
      { name: "ปุ๋ยบำรุงต้นหลังเก็บ 15-15-15", unit: "กก.", quantityPerRai: 20, costPerUnit: 22 },
    ],
    pesticides: [
      { name: "ยาป้องกันราน้ำค้างหลังเก็บ", unit: "ลิตร", quantityPerRai: 0.6, costPerUnit: 380 },
    ],
  },
];

router.post("/fertilizer/calculate", async (req, res): Promise<void> => {
  const parsed = CalculateFertilizerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { areRai, treeCount, stage } = parsed.data;
  const stageData = STAGES.find((s) => s.stage === stage);

  if (!stageData) {
    res.status(400).json({ error: "Invalid stage. Must be 1-4." });
    return;
  }

  const fertilizers: FertilizerItem[] = stageData.fertilizers.map((f) => {
    const totalQuantity = (f as any).perTree
      ? f.quantityPerRai * treeCount
      : f.quantityPerRai * areRai;
    const totalCost = totalQuantity * f.costPerUnit;
    return {
      name: f.name,
      unit: f.unit,
      quantityPerRai: f.quantityPerRai,
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      estimatedCostPerUnit: f.costPerUnit,
      totalCost: Math.round(totalCost),
    };
  });

  const pesticides: FertilizerItem[] = stageData.pesticides.map((p) => {
    const totalQuantity = (p as any).perTree
      ? p.quantityPerRai * treeCount
      : p.quantityPerRai * areRai;
    const totalCost = totalQuantity * p.costPerUnit;
    return {
      name: p.name,
      unit: p.unit,
      quantityPerRai: p.quantityPerRai,
      totalQuantity: Math.round(totalQuantity * 100) / 100,
      estimatedCostPerUnit: p.costPerUnit,
      totalCost: Math.round(totalCost),
    };
  });

  const totalFertilizerCost = fertilizers.reduce((sum, f) => sum + f.totalCost, 0);
  const totalPesticideCost = pesticides.reduce((sum, p) => sum + p.totalCost, 0);
  const totalCost = totalFertilizerCost + totalPesticideCost;
  const costPerRai = areRai > 0 ? Math.round(totalCost / areRai) : 0;
  const costPerTree = treeCount > 0 ? Math.round((totalCost / treeCount) * 10) / 10 : 0;

  const result = {
    stage: stageData.stage,
    stageName: stageData.stageName,
    fertilizers,
    pesticides,
    totalFertilizerCost: Math.round(totalFertilizerCost),
    totalPesticideCost: Math.round(totalPesticideCost),
    totalCost: Math.round(totalCost),
    costPerRai,
    costPerTree,
  };

  res.json(CalculateFertilizerResponse.parse(result));
});

export default router;
