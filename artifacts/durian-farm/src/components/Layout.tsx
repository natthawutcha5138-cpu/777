import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "แดชบอร์ด", icon: "🌿" },
  { path: "/accounting", label: "บัญชีสวน", icon: "📒" },
  { path: "/plots", label: "ข้อมูลแปลง", icon: "🗺️" },
  { path: "/fertilizer", label: "คำนวณปุ๋ย/ยา", icon: "⚗️" },
  { path: "/forecast", label: "พยากรณ์ฤดูกาล", icon: "📈" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header
        className="sticky top-0 z-50 border-b border-border/60"
        style={{ background: "linear-gradient(135deg, hsl(145 42% 96%) 0%, hsl(270 40% 97%) 50%, hsl(28 80% 97%) 100%)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-15 gap-6">
          <div className="flex items-center gap-2.5 shrink-0 py-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm"
              style={{ background: "linear-gradient(135deg, hsl(145 42% 55%), hsl(145 42% 45%))" }}
            >
              🌱
            </div>
            <div>
              <p className="font-bold text-sm text-foreground leading-none">DurianFarm AI</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">ระบบจัดการสวนทุเรียน</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto py-2 flex-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer",
                    location === item.path
                      ? "bg-white text-primary shadow-sm border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                  )}
                >
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-7">
        {children}
      </main>

      <footer className="border-t border-border/50 py-3">
        <p className="text-center text-xs text-muted-foreground">DurianFarm AI • ระบบจัดการสวนทุเรียนไทย</p>
      </footer>
    </div>
  );
}
