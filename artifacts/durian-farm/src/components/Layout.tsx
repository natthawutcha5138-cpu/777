import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/hooks/useAuth";
import {
  Home, Wallet, Calculator, Sprout, BarChart3,
  Bell, Search, ChevronDown, LogOut, Menu, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";
import { useState } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fdf2f8 50%, #fefce8 100%)" }}>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          "shrink-0 bg-white shadow-2xl rounded-r-3xl flex flex-col sticky top-0 h-screen overflow-y-auto z-40 transition-all duration-300",
          /* desktop: toggled width */
          sidebarOpen ? "w-56" : "w-[68px]",
          /* mobile: slide in/out as fixed overlay */
          "max-lg:fixed max-lg:left-0 max-lg:top-0",
          mobileSidebarOpen ? "max-lg:translate-x-0 max-lg:w-56" : "max-lg:-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="p-4 pb-2 flex items-center gap-2 min-h-0 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-lg shadow-md shrink-0">
            🌳
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-[12px] text-green-700 leading-tight truncate">ทุเรียนสมาร์ทฟาร์ม</h1>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">AI Farm Management</p>
            </div>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex ml-auto p-1 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors shrink-0"
            title={sidebarOpen ? "ย่อเมนู" : "ขยายเมนู"}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="mx-3 h-px bg-gray-100 mb-2" />

        {/* Navigation */}
        <nav className="px-2 space-y-0.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path} onClick={() => setMobileSidebarOpen(false)}>
                <div
                  title={!sidebarOpen ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium",
                    !sidebarOpen && "justify-center px-2",
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-200"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {sidebarOpen && <span className="text-[13px] truncate">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Compact Weather — only when expanded */}
        {sidebarOpen && (
          <div className="px-2 mt-2">
            <WeatherWidget compact />
          </div>
        )}

        {/* User row */}
        <div className="p-3 border-t border-gray-100 mt-2 shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{user.displayName}</p>
                <p className="text-[10px] text-gray-400">เจ้าของสวน</p>
              </div>
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                {user.displayName.charAt(0)}
              </div>
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header — compact */}
        <header className="bg-white/80 backdrop-blur-md border-b border-white/60 px-4 py-2 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-800 truncate">
              สวัสดี, {user.displayName}
            </h2>
            <p className="text-[10px] text-gray-400 hidden sm:block">ระบบบริหารจัดการสวนทุเรียนอัจฉริยะ</p>
          </div>

          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              placeholder="ค้นหาข้อมูล..."
              className="pl-8 pr-3 py-1.5 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-green-300 rounded-lg text-xs w-44 outline-none transition-all"
            />
          </div>

          <button className="relative w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-pink-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">3</span>
          </button>

          <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
              {user.displayName.charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-700 hidden md:inline">{user.displayName}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        </header>

        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
