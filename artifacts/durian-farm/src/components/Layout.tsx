import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/",            label: "ภาพรวมสวน" },
  { path: "/accounting",  label: "บัญชีรายรับ-จ่าย" },
  { path: "/plots",       label: "ข้อมูลแปลง" },
  { path: "/fertilizer",  label: "คำนวณปุ๋ยและยา" },
  { path: "/forecast",    label: "พยากรณ์ฤดูกาล" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary border-b border-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center h-13">
          <div className="flex items-center gap-3 shrink-0 mr-8">
            <div className="w-6 h-6 rounded bg-primary-foreground/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-primary-foreground" />
            </div>
            <span className="text-primary-foreground font-semibold text-base tracking-wide">
              ระบบจัดการสวนทุเรียน
            </span>
          </div>
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={cn(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer inline-block",
                    location === item.path
                      ? "text-primary-foreground border-b-2 border-primary-foreground"
                      : "text-primary-foreground/65 hover:text-primary-foreground/90"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
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
