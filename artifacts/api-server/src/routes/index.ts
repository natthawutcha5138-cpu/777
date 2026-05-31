import { Router, type IRouter } from "express";
import healthRouter from "./health";
import plotsRouter from "./plots";
import transactionsRouter from "./transactions";
import fertilizerRouter from "./fertilizer";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(plotsRouter);
router.use(transactionsRouter);
router.use(fertilizerRouter);
router.use(dashboardRouter);

export default router;
