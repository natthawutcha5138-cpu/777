import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/hooks/useAuth";

const navItems = [
  { path: "/",            label: "ภาพรวมสวน" },
  { path: "/accounting",  label: "บัญชีรายรับ-จ่าย" },
  { path: "/plots",       label: "ข้อมูลแปลง" },
  { path: "/fertilizer",  label: "คำนวณปุ๋ยและยา" },
  { path: "/forecast",    label: "พยากรณ์ฤดูกาล" },
];

interface LayoutProps {
  children: React.ReactNode;
  user: AuthUser;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary border-b border-primary/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center h-12">
          <div className="flex items-center gap-3 shrink-0 mr-8">
            <div className="w-5 h-5 rounded bg-primary-foreground/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary-foreground" />
            </div>
            <span className="text-primary-foreground font-semibold text-sm tracking-wide hidden sm:inline">
              ระบบจัดการสวนทุเรียน
            </span>
          </div>
          <nav className="flex items-center gap-0.5 overflow-x-auto flex-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={cn(
                    "px-3.5 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer inline-block",
                    location === item.path
                      ? "text-primary-foreground border-b-2 border-primary-foreground"
                      : "text-primary-foreground/60 hover:text-primary-foreground/90"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 ml-3 shrink-0">
            <span className="text-xs text-primary-foreground/70 hidden md:inline">{user.displayName}</span>
            <button
              onClick={onLogout}
              className="text-xs text-primary-foreground/70 hover:text-primary-foreground border border-primary-foreground/25 hover:border-primary-foreground/50 rounded px-2.5 py-1.5 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-7">
        {children}
      </main>

      <footer className="border-t border-border py-3 bg-card">
        <p className="text-center text-xs text-muted-foreground">
          ระบบจัดการสวนทุเรียน · ข้อมูลอากาศจาก Open-Meteo
        </p>
      </footer>
    </div>
  );
}
