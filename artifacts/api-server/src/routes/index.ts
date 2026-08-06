// @ts-nocheck
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import plotsRouter from "./plots";
import transactionsRouter from "./transactions";
import fertilizerRouter from "./fertilizer";
import dashboardRouter from "./dashboard";
import authRouter from "./auth";
import tasksRouter from "./tasks";
import workersRouter from "./workers";
import inventoryRouter from "./inventory";
import equipmentRouter from "./equipment";
import notificationsRouter from "./notifications";
import settingsRouter from "./settings";
import searchRouter from "./search";
import farmHistoryRouter from "./farmHistory";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(plotsRouter);
router.use(transactionsRouter);
router.use(fertilizerRouter);
router.use(dashboardRouter);
router.use(tasksRouter);
router.use(workersRouter);
router.use(inventoryRouter);
router.use(equipmentRouter);
router.use(notificationsRouter);
router.use(settingsRouter);
router.use(searchRouter);
router.use(farmHistoryRouter);

export default router;
