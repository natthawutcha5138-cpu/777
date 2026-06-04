import { useState } from "react";
import type { AuthUser } from "@/hooks/useAuth";

interface LoginPageProps {
  onLogin:    (username: string, password: string) => Promise<string | null>;
  onRegister: (username: string, password: string, displayName: string) => Promise<string | null>;
}

type Mode = "login" | "register";

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
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
      ? await onLogin(username, password)
      : await onRegister(username, password, displayName);
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fdf2f8 50%, #fefce8 100%)" }}
    >
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-yellow-200/20" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-6xl shadow-2xl shadow-green-200 mx-auto mb-8">
            🌳
          </div>
          <h1 className="text-4xl font-bold text-green-700 mb-3">ทุเรียนสมาร์ทฟาร์ม</h1>
          <p className="text-base text-gray-500 mb-10 leading-relaxed">
            ระบบบริหารจัดการสวนทุเรียนอัจฉริยะ<br />ด้วย AI ครบวงจร
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "📊", label: "ติดตามรายรับ-จ่าย" },
              { icon: "🌱", label: "คำนวณปุ๋ยอัตโนมัติ" },
              { icon: "🤖", label: "AI วิเคราะห์สวน" },
            ].map((f) => (
              <div key={f.label} className="bg-white/60 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-white/80">
                <div className="text-3xl mb-2">{f.icon}</div>
                <p className="text-xs text-gray-600 font-medium leading-tight">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl shadow-md">
              🌳
            </div>
            <div>
              <h1 className="font-bold text-lg text-green-700">ทุเรียนสมาร์ทฟาร์ม</h1>
              <p className="text-xs text-gray-400">AI Farm Management</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-green-100/50 p-8">
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </h2>
              <p className="text-sm text-gray-400 mt-1.5">
                {mode === "login"
                  ? "เข้าสู่ระบบเพื่อจัดการสวนทุเรียนของคุณ"
                  : "สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    ชื่อที่แสดงในระบบ
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="เช่น นายสมชาย ใจดี"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all placeholder:text-gray-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _"
                  required
                  autoComplete="username"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "อย่างน้อย 6 ตัวอักษร" : "รหัสผ่านของคุณ"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all placeholder:text-gray-400"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-1"
              >
                {loading
                  ? (mode === "login" ? "กำลังเข้าสู่ระบบ..." : "กำลังสมัครสมาชิก...")
                  : (mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก")}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              {mode === "login" ? (
                <p className="text-sm text-gray-500">
                  ยังไม่มีบัญชี?{" "}
                  <button
                    onClick={() => { setMode("register"); setError(null); }}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    สมัครสมาชิกฟรี
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  มีบัญชีแล้ว?{" "}
                  <button
                    onClick={() => { setMode("login"); setError(null); }}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    เข้าสู่ระบบ
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            ระบบจัดการสวนทุเรียน · ข้อมูลส่วนตัวเก็บบนเซิร์ฟเวอร์ของคุณเท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
}
