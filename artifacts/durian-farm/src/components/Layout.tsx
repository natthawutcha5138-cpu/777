import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/hooks/useAuth";
import {
  Home, Wallet, Calculator, Sprout, BarChart3,
  Bell, Search, ChevronDown, LogOut, Menu, X,
  Sun, Moon, Settings, User, ChevronLeft, ChevronRight,
  Zap, TrendingUp,
} from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { path: "/",            label: "หน้าหลัก",              icon: Home,       badge: null  },
  { path: "/accounting",  label: "บัญชีรายรับ-รายจ่าย", icon: Wallet,     badge: null  },
  { path: "/fertilizer",  label: "คำนวณปุ๋ยและยา",       icon: Calculator, badge: "ใหม่" },
  { path: "/plots",       label: "จัดการแปลง",           icon: Sprout,     badge: null  },
  { path: "/forecast",    label: "พยากรณ์ฤดูกาล",         icon: BarChart3,  badge: null  },
];

const notifications = [
  { id: 1, title: "ถึงเวลาใส่ปุ๋ยแล้ว", body: "แปลงที่ 1 ครบกำหนดใส่ปุ๋ยสัปดาห์นี้", time: "5 นาทีที่แล้ว", unread: true, icon: "🌿" },
  { id: 2, title: "ราคาทุเรียนพุ่งขึ้น", body: "หมอนทองวันนี้ 220 บาท/กก. สูงสุดในรอบ 3 เดือน", time: "1 ชั่วโมงที่แล้ว", unread: true, icon: "📈" },
  { id: 3, title: "ฝนกำลังจะตก", body: "คาดการณ์ฝนตก 14:00–16:00 งดพ่นยาวันนี้", time: "2 ชั่วโมงที่แล้ว", unread: false, icon: "🌧️" },
];

interface LayoutProps {
  children: React.ReactNode;
  user: AuthUser;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [location] = useLocation();
  const [collapsed,     setCollapsed]     = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [showUser,      setShowUser]      = useState(false);
  const [showNotif,     setShowNotif]     = useState(false);
  const { theme, toggle: toggleTheme }    = useTheme();

  const userRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;
  const showLabel   = !collapsed || mobileOpen;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== Sidebar ===== */}
      <aside className={cn(
        "shrink-0 flex flex-col sticky top-0 h-screen z-50 transition-all duration-300",
        "bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800",
        collapsed ? "w-[68px]" : "w-60",
        "max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:h-screen max-lg:shadow-2xl",
        mobileOpen ? "max-lg:translate-x-0 max-lg:w-64" : "max-lg:-translate-x-full",
      )}>

        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0",
          collapsed && !mobileOpen && "px-[18px]"
        )}>
          <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-sm shadow-lg shadow-green-200 dark:shadow-green-900/40 shrink-0">
            🌳
          </div>
          {showLabel && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">ทุเรียนฟาร์ม</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">AI Management</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ml-auto shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon, badge }) => {
            const active = location === path;
            return (
              <Link
                key={path}
                href={path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium no-underline relative",
                  !showLabel && "justify-center px-[18px]",
                  active
                    ? "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100"
                )}
                title={!showLabel ? label : undefined}
              >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-green-600 rounded-full" />}
                <Icon className={cn("w-[18px] h-[18px] shrink-0 transition-transform duration-150 group-hover:scale-105", active && "text-green-600 dark:text-green-400")} />
                {showLabel && (
                  <span className="flex-1 truncate">{label}</span>
                )}
                {showLabel && badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Durian illustration */}
        {showLabel && (
          <div className="mx-3 mb-2 rounded-2xl overflow-hidden relative shrink-0" style={{ background: "linear-gradient(180deg, #1a3a20 0%, #2d5a1b 50%, #4a7c2a 100%)" }}>
            <svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <ellipse cx="90" cy="95" rx="95" ry="14" fill="#2d5a1b" />
              <rect x="22" y="58" width="36" height="28" rx="2" fill="#e8d5a3" />
              <polygon points="22,58 40,40 58,58" fill="#c0392b" />
              <rect x="33" y="70" width="10" height="16" rx="1" fill="#8b6914" />
              <rect x="25" y="63" width="7" height="7" rx="1" fill="#7ecbf5" />
              <rect x="46" y="63" width="7" height="7" rx="1" fill="#7ecbf5" />
              <rect x="73" y="62" width="4" height="24" rx="1" fill="#5d4037" />
              <ellipse cx="75" cy="52" rx="14" ry="16" fill="#2e7d32" />
              <ellipse cx="75" cy="49" rx="10" ry="12" fill="#388e3c" />
              <ellipse cx="122" cy="65" rx="22" ry="26" fill="#8d6e28" />
              <ellipse cx="122" cy="65" rx="19" ry="23" fill="#a0874a" />
              {[[-14,-18],[0,-25],[14,-18],[18,-5],[15,10],[0,20],[-15,10],[-18,-5]].map(([dx,dy], i) => (
                <polygon key={i} points={`${122+dx!},${65+dy!} ${122+dx!-3},${65+dy!+6} ${122+dx!+3},${65+dy!+6}`} fill="#7a5c20" />
              ))}
              <path d="M122,42 Q132,52 122,88 Q112,52 122,42" fill="#c9a84c" opacity="0.5" />
            </svg>
          </div>
        )}

        {/* Weather — only when expanded */}
        {showLabel && (
          <div className="px-2 mb-2 shrink-0">
            <WeatherWidget compact />
          </div>
        )}

        {/* Dark mode + user */}
        <div className="px-2 pb-3 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-2 shrink-0">
          <button
            onClick={toggleTheme}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              !showLabel && "justify-center px-[18px]",
              "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100"
            )}
            title={!showLabel ? (theme === "dark" ? "โหมดสว่าง" : "โหมดมืด") : undefined}
          >
            {theme === "dark"
              ? <Sun className="w-[18px] h-[18px] shrink-0" />
              : <Moon className="w-[18px] h-[18px] shrink-0" />}
            {showLabel && <span>{theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}</span>}
          </button>

          {showLabel ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all">
              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-700 dark:text-green-400 text-xs font-bold shrink-0">
                {user.displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user.displayName}</p>
                <p className="text-[10px] text-gray-400">เจ้าของสวน</p>
              </div>
              <button onClick={onLogout} title="ออกจากระบบ" className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-700 dark:text-green-400 text-xs font-bold">
                {user.displayName.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              placeholder="ค้นหา..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 border border-transparent focus:border-green-300 dark:focus:border-green-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none transition-all"
            />
          </div>

          <div className="flex-1" />

          {/* Dark mode toggle (topbar) */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(v => !v)}
              className="relative w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">การแจ้งเตือน</p>
                  <span className="text-xs text-gray-400">{unreadCount} ใหม่</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {notifications.map(n => (
                    <div key={n.id} className={cn("flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors", n.unread && "bg-green-50/50 dark:bg-green-950/20")}>
                      <span className="text-xl shrink-0 mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{n.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                      {n.unread && <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
                  <button className="text-xs text-green-600 font-semibold hover:underline">ดูทั้งหมด</button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative shrink-0" ref={userRef}>
            <button
              onClick={() => setShowUser(v => !v)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-700 dark:text-green-400 text-xs font-bold">
                {user.displayName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:inline">{user.displayName}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform duration-200", showUser && "rotate-180")} />
            </button>

            {showUser && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-700 dark:text-green-400 font-bold">
                      {user.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.displayName}</p>
                      <p className="text-xs text-gray-400">เจ้าของสวน</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <User className="w-4 h-4 text-gray-400" />โปรไฟล์
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />ตั้งค่า
                  </button>
                  <button
                    onClick={() => { setShowUser(false); onLogout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
