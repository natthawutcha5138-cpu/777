// @ts-nocheck
import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { z } from "zod";

const router: IRouter = Router();

const RegisterBody = z.object({
  username:    z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _"),
  password:    z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  displayName: z.string().min(1).max(60),
});

const LoginBody = z.object({
  username: z.string(),
  password: z.string(),
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" });
    return;
  }
  const { username, password, displayName } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existing.length > 0) {
    res.status(409).json({ error: "ชื่อผู้ใช้นี้มีอยู่แล้ว" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ username, passwordHash, displayName }).returning();
  req.session.userId = user.id;
  res.status(201).json({ id: user.id, username: user.username, displayName: user.displayName });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
    return;
  }
  const { username, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) {
    res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    return;
  }
  req.session.userId = user.id;
  res.json({ id: user.id, username: user.username, displayName: user.displayName });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => res.sendStatus(204));
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "ไม่ได้เข้าสู่ระบบ" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!user) {
    res.status(401).json({ error: "ไม่พบผู้ใช้" });
    return;
  }
  res.json({ id: user.id, username: user.username, displayName: user.displayName });
});

export default router;
