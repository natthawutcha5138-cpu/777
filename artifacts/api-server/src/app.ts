import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import { pinoHttp } from "pino-http";
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
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger: logger as any,
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
// Build an explicit allowlist from environment; fall back to localhost only.
// REPLIT_DEV_DOMAIN is injected by the platform in both dev and production.
const allowedOrigins: (string | RegExp)[] = ["http://localhost:24275", "http://localhost:80"];
if (process.env.REPLIT_DEV_DOMAIN) {
  // e.g. https://abc123.replit.dev  — allow that exact origin
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}
if (process.env.REPLIT_DOMAINS) {
  // Comma-separated list of production domains
  for (const d of process.env.REPLIT_DOMAINS.split(",")) {
    const domain = d.trim();
    if (domain) allowedOrigins.push(`https://${domain}`);
  }
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server requests with no Origin header
      if (!origin) return cb(null, true);
      if (allowedOrigins.some(o => (typeof o === "string" ? o === origin : o.test(origin)))) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);
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
      // "lax" is safe for same-site requests (frontend & API share the same
      // Replit domain via path-based routing). "none" + credentials=true would
      // require a verified CORS allowlist and is unnecessary here.
      sameSite: "lax",
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
