import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const AUTO_USER = "farmowner";
const AUTO_PASS = "durian2024";

async function apiFetch(path: string, opts?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    credentials: "include",
    ...opts,
    headers: { "Content-Type": "application/json", ...opts?.headers },
  });
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

async function autoLogin(): Promise<AuthUser | null> {
  try {
    const loginRes = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: AUTO_USER, password: AUTO_PASS }),
    });
    if (loginRes.ok) return (await loginRes.json()) as AuthUser;

    const regRes = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username: AUTO_USER, password: AUTO_PASS, displayName: "เจ้าของสวน" }),
    });
    if (regRes.ok) return (await regRes.json()) as AuthUser;
  } catch { /* ignore */ }
  return null;
}

export function useAuth() {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        setUser(await res.json());
      } else {
        const auto = await autoLogin();
        setUser(auto);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const res  = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
      const data = await safeJson(res) as Record<string, unknown>;
      if (!res.ok) return (data.error as string) ?? "เข้าสู่ระบบไม่สำเร็จ";
      setUser(data as unknown as AuthUser);
      return null;
    } catch { return "เกิดข้อผิดพลาด กรุณาลองใหม่"; }
  }, []);

  const register = useCallback(async (username: string, password: string, displayName: string): Promise<string | null> => {
    try {
      const res  = await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password, displayName }) });
      const data = await safeJson(res) as Record<string, unknown>;
      if (!res.ok) return (data.error as string) ?? "สมัครสมาชิกไม่สำเร็จ";
      setUser(data as unknown as AuthUser);
      return null;
    } catch { return "เกิดข้อผิดพลาด กรุณาลองใหม่"; }
  }, []);

  const logout = useCallback(async () => {
    try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    const auto = await autoLogin();
    setUser(auto);
  }, []);

  return { user, loading, login, register, logout };
}
