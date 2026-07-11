import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthContext } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Accounting from "@/pages/Accounting";
import Plots from "@/pages/Plots";
import Fertilizer from "@/pages/Fertilizer";
import Forecast from "@/pages/Forecast";
import AIAnalysis from "@/pages/AIAnalysis";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppShell() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center text-white text-xl animate-pulse">
            🌳
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-sm text-gray-400">กำลังโหลดระบบ...</p>
        </div>
      </div>
    );
  }

  const resolvedUser = user ?? { id: 0, username: "guest", displayName: "เจ้าของสวน" };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      <Layout user={resolvedUser} onLogout={logout}>
        <Switch>
          <Route path="/"           component={Dashboard} />
          <Route path="/accounting" component={Accounting} />
          <Route path="/plots"      component={Plots} />
          <Route path="/fertilizer" component={Fertilizer} />
          <Route path="/forecast"    component={Forecast} />
          <Route path="/ai-analysis" component={AIAnalysis} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppShell />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
