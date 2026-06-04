import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/hooks/useAuth";
import {
  Home, Wallet, Calculator, Sprout, BarChart3,
  Bell, Search, ChevronDown, LogOut,
} from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";

const navItems = [
  { path: "/",            label: "หน้าหลัก",              icon: Home },
  { path: "/accounting",  label: "บัญชีรายรับ-รายจ่าย", icon: Wallet },
  { path: "/fertilizer",  label: "คำนวณปุ๋ยและยา",       icon: Calculator },
  { path: "/plots",       label: "ข้อมูลแปลง",           icon: Sprout },
  { path: "/forecast",    label: "พยากรณ์ฤดูกาล",         icon: BarChart3 },
];

interface LayoutProps {
  children: React.ReactNode;
  user: AuthUser;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fdf2f8 50%, #fefce8 100%)" }}
    >
      {/* ===== Sidebar ===== */}
      <aside className="w-64 shrink-0 bg-white shadow-2xl rounded-r-3xl flex flex-col sticky top-0 h-screen overflow-y-auto z-40">

        {/* Logo */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl shadow-md shrink-0">
              🌳
            </div>
            <div>
              <h1 className="font-bold text-sm text-green-700 leading-tight">ทุเรียนสมาร์ทฟาร์ม</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">AI Farm Management</p>
            </div>
          </div>
        </div>

        <div className="mx-4 h-px bg-gray-100 mb-3" />

        {/* Navigation */}
        <nav className="px-3 space-y-0.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all text-sm font-medium",
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-200"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="text-[13px]">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Compact Weather */}
        <div className="px-3 mt-3">
          <WeatherWidget compact />
        </div>

        {/* User row */}
        <div className="p-4 border-t border-gray-100 mt-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{user.displayName}</p>
              <p className="text-[11px] text-gray-400">เจ้าของสวน</p>
            </div>
            <button
              onClick={onLogout}
              title="ออกจากระบบ"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-white/60 px-8 py-3.5 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">
              👋 สวัสดี, {user.displayName}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">ระบบบริหารจัดการสวนทุเรียนอัจฉริยะ</p>
          </div>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="ค้นหาข้อมูล..."
              className="pl-9 pr-4 py-2 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-green-300 rounded-xl text-sm w-60 outline-none transition-all"
            />
          </div>

          <button className="relative w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">3</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
              {user.displayName.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:inline">{user.displayName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
