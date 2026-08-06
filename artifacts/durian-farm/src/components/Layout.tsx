import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/hooks/useAuth";
import {
  Home, Wallet, Calculator, Sprout, BarChart3, Brain,
  Bell, Search, ChevronDown, LogOut, Menu, X,
  Sun, Moon, Settings, User, ChevronLeft, ChevronRight,
  Zap, CheckSquare, Users, PackageOpen, Hammer, History
} from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { useGetUnreadNotificationCount, useListNotifications, useGlobalSearch, getGetUnreadNotificationCountQueryKey, getListNotificationsQueryKey, getGlobalSearchQueryKey } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";

const navItems = [
  { path: "/",            label: "หน้าหลัก",              icon: Home,      badge: null },
  { path: "/tasks",       label: "จัดการงาน",             icon: CheckSquare, badge: null },
  { path: "/plots",       label: "จัดการแปลง",           icon: Sprout,    badge: null },
  { path: "/accounting",  label: "บัญชีรายรับ-รายจ่าย", icon: Wallet,    badge: null },
  { path: "/workers",     label: "บุคลากร",               icon: Users,     badge: null },
  { path: "/inventory",   label: "คลังสินค้า",             icon: PackageOpen,badge: null },
  { path: "/equipment",   label: "เครื่องมือเครื่องจักร",     icon: Hammer,    badge: null },
  { path: "/fertilizer",  label: "คำนวณปุ๋ยและยา",       icon: Calculator,badge: null },
  { path: "/farm-history",label: "ข้อมูลย้อนหลัง",         icon: History,   badge: null },
  { path: "/forecast",    label: "พยากรณ์ฤดูกาล",         icon: BarChart3, badge: null },
  { path: "/ai-analysis", label: "AI วิเคราะห์ฟาร์ม",    icon: Brain,     badge: "AI" },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "หน้าหลัก",
  "/accounting": "บัญชีรายรับ-รายจ่าย",
  "/fertilizer": "คำนวณปุ๋ยและยา",
  "/farm-history": "ข้อมูลย้อนหลัง / ประวัติสวน",
  "/plots": "จัดการแปลง",
  "/forecast": "พยากรณ์ฤดูกาล",
  "/ai-analysis": "AI วิเคราะห์ฟาร์ม",
  "/tasks": "จัดการงาน",
  "/workers": "บุคลากร",
  "/inventory": "คลังสินค้า",
  "/equipment": "เครื่องมือเครื่องจักร",
  "/notifications": "การแจ้งเตือน",
  "/settings": "ตั้งค่าระบบ",
};

interface LayoutProps { children: React.ReactNode; user: AuthUser; onLogout: () => void; }

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUser,   setShowUser]   = useState(false);
  const [showNotif,  setShowNotif]  = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggle: toggleTheme } = useTheme();

  const userRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: unreadCountData } = useGetUnreadNotificationCount({ query: { queryKey: getGetUnreadNotificationCountQueryKey(), enabled: !!user?.id, refetchInterval: 60000 } });
  const { data: notifications = [] } = useListNotifications({ query: { queryKey: getListNotificationsQueryKey(), enabled: showNotif } });
  
  const { data: searchResults } = useGlobalSearch({ q: searchQuery }, { query: { queryKey: getGlobalSearchQueryKey({ q: searchQuery }), enabled: searchQuery.length > 1 } });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = unreadCountData?.count || 0;
  const showLabel   = !collapsed || mobileOpen;
  const pageTitle   = PAGE_TITLES[location] ?? "ทุเรียนฟาร์ม";

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] dark:bg-[#0D0F14] transition-colors duration-300">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "shrink-0 flex flex-col sticky top-0 h-screen z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "bg-white dark:bg-[#111318] border-r border-gray-100 dark:border-white/[0.06]",
        collapsed ? "w-[60px]" : "w-56",
        "max-lg:fixed max-lg:left-0 max-lg:top-0 max-lg:h-screen max-lg:shadow-2xl",
        mobileOpen ? "max-lg:translate-x-0 max-lg:w-60" : "max-lg:-translate-x-full",
      )}>

        {/* Logo row */}
        <div className={cn(
          "flex items-center gap-2.5 border-b border-gray-100 dark:border-white/[0.06] shrink-0 h-14 px-4",
          collapsed && !mobileOpen && "justify-center px-0"
        )}>
          <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center text-[13px] shadow-md shadow-green-900/20 shrink-0">
            🌳
          </div>
          {showLabel && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate leading-none">ทุเรียนฟาร์ม</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wider">AI Management</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-5 h-5 items-center justify-center rounded-md text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all ml-auto shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-px overflow-y-auto">
          {showLabel && (
            <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-widest">เมนูหลัก</p>
          )}

          {navItems.map(({ path, label, icon: Icon, badge }) => {
            const active = location === path;
            return (
              <Link
                key={path}
                href={path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-[13px] font-medium no-underline relative focus-ring",
                  !showLabel && "justify-center px-0 w-full",
                  active
                    ? "bg-gray-100 dark:bg-white/[0.08] text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-800 dark:hover:text-gray-200"
                )}
                title={!showLabel ? label : undefined}
              >
                <Icon className={cn(
                  "w-[16px] h-[16px] shrink-0 transition-colors duration-150",
                  active ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                )} />
                {showLabel && <span className="flex-1 truncate">{label}</span>}
                {showLabel && badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full leading-none">
                    {badge}
                  </span>
                )}
                {active && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Weather compact */}
        {showLabel && (
          <div className="px-2 mb-2 shrink-0">
            <WeatherWidget compact />
          </div>
        )}

        {/* Bottom actions */}
        <div className={cn("px-2 pb-3 pt-2 space-y-px border-t border-gray-100 dark:border-white/[0.06] shrink-0", !showLabel && "flex flex-col items-center")}>

          <button
            onClick={toggleTheme}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
              !showLabel && "justify-center w-9 h-9 px-0",
              "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-800 dark:hover:text-gray-200"
            )}
            title={!showLabel ? (theme === "dark" ? "โหมดสว่าง" : "โหมดมืด") : undefined}
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 shrink-0 text-gray-400" />
              : <Moon className="w-4 h-4 shrink-0 text-gray-400" />}
            {showLabel && <span className="text-gray-500">{theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}</span>}
          </button>

          {showLabel ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all cursor-default">
              <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 text-[10px] font-bold shrink-0">
                {user.displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 truncate leading-none">{user.displayName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">เจ้าของสวน</p>
              </div>
              <button onClick={onLogout} title="ออกจากระบบ" className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0 focus-ring">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 text-[10px] font-bold mx-auto">
              {user.displayName.charAt(0)}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-5 bg-white/90 dark:bg-[#111318]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06]">

          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors shrink-0"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-gray-300 shrink-0">
            <span className="text-gray-300 dark:text-gray-600 text-[11px]">ทุเรียนฟาร์ม</span>
            <span className="text-gray-200 dark:text-gray-700">/</span>
            <span>{pageTitle}</span>
          </div>

          <div className="relative flex-1 max-w-sm hidden md:block ml-2" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              placeholder="ค้นหา (แปลง, รายการ, งาน, ...)"
              className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#16191f] border border-transparent focus:border-green-500/30 dark:focus:border-green-500/30 rounded-lg text-[13px] text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-150"
            />
            {showSearch && searchQuery.length > 1 && searchResults && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#16191f] border border-gray-100 dark:border-white/[0.06] rounded-xl shadow-xl overflow-hidden z-50">
                <div className="max-h-[300px] overflow-y-auto p-1.5">
                  {searchResults.results.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500">ไม่พบผลลัพธ์</div>
                  ) : (
                    searchResults.results.map(r => (
                      <Link 
                        key={`${r.type}-${r.id}`} 
                        href={r.path}
                        onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                        className="flex flex-col p-2 hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded-lg cursor-pointer"
                      >
                        <span className="text-[13px] font-semibold text-gray-900 dark:text-white">{r.title}</span>
                        <span className="text-[11px] text-gray-500">{r.subtitle}</span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1">

            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-gray-300 transition-all focus-ring"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(v => !v)}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-gray-300 transition-all focus-ring"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-[#111318]" />
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50" style={{ boxShadow: "var(--shadow-xl)", border: "1px solid hsl(var(--border))" }}>
                  <div className="bg-white dark:bg-[#16191f]">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100">การแจ้งเตือน</p>
                      {unreadCount > 0 && <span className="badge badge-green">{unreadCount} ใหม่</span>}
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/[0.04] max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500">ไม่มีการแจ้งเตือน</div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div key={n.id} className={cn("flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors", !n.read && "bg-green-50/60 dark:bg-green-950/10")} onClick={() => { setLocation("/notifications"); setShowNotif(false); }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 leading-snug">{n.title}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{n.body}</p>
                            </div>
                            {!n.read && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0 mt-1.5" />}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/[0.06]">
                      <button onClick={() => { setLocation("/notifications"); setShowNotif(false); }} className="w-full text-center text-[11px] font-semibold text-green-600 dark:text-green-400 hover:text-green-700 transition-colors">ดูทั้งหมด</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative shrink-0 ml-1" ref={userRef}>
              <button
                onClick={() => setShowUser(v => !v)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all focus-ring"
              >
                <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 text-[10px] font-bold">
                  {user.displayName.charAt(0)}
                </div>
                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 hidden md:inline">{user.displayName}</span>
                <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform duration-200", showUser && "rotate-180")} />
              </button>

              {showUser && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-50" style={{ boxShadow: "var(--shadow-xl)", border: "1px solid hsl(var(--border))" }}>
                  <div className="bg-white dark:bg-[#16191f]">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm">
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100">{user.displayName}</p>
                          <p className="text-[11px] text-gray-400">เจ้าของสวน</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-1.5 space-y-px">
                      <button onClick={() => { setLocation("/settings"); setShowUser(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                        <Settings className="w-3.5 h-3.5 text-gray-400" /> ตั้งค่าองค์กร
                      </button>
                      <button
                        onClick={() => { setShowUser(false); onLogout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">
          <div key={location} className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
