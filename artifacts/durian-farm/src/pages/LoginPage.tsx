import { useState } from "react";

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
    <div className="min-h-screen flex">

      {/* ===== LEFT PANEL — real farm photo ===== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden">

        {/* Background: real durian farm photo */}
        <img
          src="/images/farm-wide.jpg"
          alt="สวนทุเรียน"
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        {/* Green overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/75 via-green-800/60 to-emerald-700/50" />

        {/* Soft vignette at edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">

          {/* Top: Logo + app name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-lg">
              🌳
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">ทุเรียนสมาร์ทฟาร์ม</h1>
              <p className="text-white/60 text-xs">AI Farm Management</p>
            </div>
          </div>

          {/* Center: Main headline */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-white/70 text-sm font-medium mb-3 tracking-wide uppercase">ยินดีต้อนรับ</p>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              บริหารสวนทุเรียน<br />
              <span className="text-green-300">อัจฉริยะ</span> ด้วย AI
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              ติดตามรายรับ-รายจ่าย คำนวณปุ๋ย พยากรณ์ฤดูกาล<br />
              และวิเคราะห์สวนของคุณแบบเรียลไทม์
            </p>

            {/* Photo strip — real durian/farm photos */}
            <div className="flex gap-2.5 mt-8">
              {[
                { src: "/images/durian-close.jpg", label: "ผลทุเรียน" },
                { src: "/images/tropical-farm.jpg", label: "สวนทุเรียน" },
                { src: "/images/thai-farm.jpg", label: "ภาคตะวันออก" },
              ].map((p) => (
                <div key={p.src} className="flex-1 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                  <div className="relative h-20">
                    <img
                      src={p.src}
                      alt={p.label}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                        const parent = el.parentElement!;
                        parent.style.background = "rgba(255,255,255,0.1)";
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">🌳</div>`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-1.5 left-2 text-[10px] text-white font-semibold drop-shadow">{p.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Feature chips */}
          <div className="flex flex-wrap gap-2">
            {["📊 บัญชีรายรับ-จ่าย", "🌿 คำนวณปุ๋ยอัตโนมัติ", "🌧️ พยากรณ์อากาศ", "📈 วิเคราะห์ผลผลิต"].map(f => (
              <span key={f} className="text-xs text-white/80 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — login form ===== */}
      <div
        className="flex-1 flex items-center justify-center p-6 min-h-screen"
        style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fdf2f8 50%, #fefce8 100%)" }}
      >
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-3xl shadow-lg shadow-green-200 mx-auto mb-4">
                🌳
              </div>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อที่แสดงในระบบ</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อผู้ใช้</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">รหัสผ่าน</label>
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
