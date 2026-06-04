// @ts-nocheck
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, plotsTable } from "@workspace/db";
import {
  CreatePlotBody,
  GetPlotParams,
  GetPlotResponse,
  UpdatePlotParams,
  UpdatePlotBody,
  UpdatePlotResponse,
  DeletePlotParams,
  ListPlotsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function computePlotStatus(treeAge: number): string {
  if (treeAge < 3) return "ยังไม่ให้ผล";
  if (treeAge <= 5) return "เริ่มให้ผลน้อย";
  return "ให้ผลเต็มที่";
}

function enrichPlot(plot: typeof plotsTable.$inferSelect) {
  return {
    ...plot,
    status: computePlotStatus(plot.treeAge),
    density: plot.areRai > 0 ? Math.round((plot.treeCount / plot.areRai) * 10) / 10 : 0,
  };
}

router.get("/plots", async (_req, res): Promise<void> => {
  const plots = await db.select().from(plotsTable).orderBy(plotsTable.createdAt);
  res.json(ListPlotsResponse.parse(plots.map(enrichPlot)));
});

router.post("/plots", async (req, res): Promise<void> => {
  const parsed = CreatePlotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [plot] = await db.insert(plotsTable).values(parsed.data).returning();
  res.status(201).json(GetPlotResponse.parse(enrichPlot(plot)));
});

router.get("/plots/:id", async (req, res): Promise<void> => {
  const params = GetPlotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [plot] = await db.select().from(plotsTable).where(eq(plotsTable.id, params.data.id));
  if (!plot) {
    res.status(404).json({ error: "Plot not found" });
    return;
  }
  res.json(GetPlotResponse.parse(enrichPlot(plot)));
});

router.patch("/plots/:id", async (req, res): Promise<void> => {
  const params = UpdatePlotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePlotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [plot] = await db
    .update(plotsTable)
    .set(parsed.data)
    .where(eq(plotsTable.id, params.data.id))
    .returning();
  if (!plot) {
    res.status(404).json({ error: "Plot not found" });
    return;
  }
  res.json(UpdatePlotResponse.parse(enrichPlot(plot)));
});

router.delete("/plots/:id", async (req, res): Promise<void> => {
  const params = DeletePlotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(plotsTable).where(eq(plotsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Plot not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
