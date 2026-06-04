import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "register";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode,        setMode]        = useState<Mode>("login");
  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error,       setError]       = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = mode === "login"
      ? await login(username, password)
      : await register(username, password, displayName);
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-primary px-6 py-3.5 flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-primary-foreground/20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary-foreground" />
        </div>
        <span className="text-primary-foreground font-semibold text-sm tracking-wide">ระบบจัดการสวนทุเรียน</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-lg shadow-md p-8">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-primary rounded-sm" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === "login" ? "เข้าสู่ระบบเพื่อจัดการสวนทุเรียนของคุณ" : "สร้างบัญชีเพื่อเริ่มต้นใช้งาน"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    ชื่อที่แสดงในระบบ
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="เช่น นายสมชาย ใจดี"
                    required
                    className="w-full border border-border rounded px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _"
                  required
                  autoComplete="username"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "อย่างน้อย 6 ตัวอักษร" : "รหัสผ่านของคุณ"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full border border-border rounded px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                />
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-60 mt-1"
              >
                {loading
                  ? (mode === "login" ? "กำลังเข้าสู่ระบบ..." : "กำลังสมัคร...")
                  : (mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก")}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-border text-center">
              {mode === "login" ? (
                <p className="text-xs text-muted-foreground">
                  ยังไม่มีบัญชี?{" "}
                  <button onClick={() => { setMode("register"); setError(null); }}
                    className="text-primary font-medium hover:underline">
                    สมัครสมาชิก
                  </button>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  มีบัญชีแล้ว?{" "}
                  <button onClick={() => { setMode("login"); setError(null); }}
                    className="text-primary font-medium hover:underline">
                    เข้าสู่ระบบ
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-5">
            ระบบจัดการสวนทุเรียน · ข้อมูลส่วนตัวเก็บบนเซิร์ฟเวอร์ของคุณเท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
}
