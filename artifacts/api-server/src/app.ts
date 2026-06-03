import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http"
import router from "./routes";
import { logger } from "./lib/logger";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const app: Express = express();
// @ts-ignore
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res: any) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

const PUBLIC_PATHS = ["/healthz", "/auth/login", "/auth/register", "/auth/me"];

app.use("/api", (req: Request, res: Response, next: NextFunction): void => {
  if (PUBLIC_PATHS.some(p => req.path === p || req.path.startsWith(p))) {
    next();
    return;
  }
  if (!req.session.userId) {
    res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
    return;
  }
  next();
});

app.use("/api", router);

export default app;
