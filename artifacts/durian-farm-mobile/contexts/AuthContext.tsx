// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  register: (username: string, password: string, displayName: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function apiFetch(path: string, opts?: RequestInit): Promise<Response> {
  const base = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  return fetch(`${base}${path}`, {
    credentials: "include",
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
  });
}

async function safeJson(res: Response): Promise<Record<string, unknown>> {
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) setUser(await res.json());
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const data = await safeJson(res);
      if (!res.ok) return (data.error as string) ?? "เข้าสู่ระบบไม่สำเร็จ";
      setUser(data as unknown as AuthUser);
      return null;
    } catch {
      return "เกิดข้อผิดพลาด กรุณาลองใหม่";
    }
  }, []);

  const register = useCallback(async (username: string, password: string, displayName: string): Promise<string | null> => {
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password, displayName }),
      });
      const data = await safeJson(res);
      if (!res.ok) return (data.error as string) ?? "สมัครสมาชิกไม่สำเร็จ";
      setUser(data as unknown as AuthUser);
      return null;
    } catch {
      return "เกิดข้อผิดพลาด กรุณาลองใหม่";
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch { /* ignore */ }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
