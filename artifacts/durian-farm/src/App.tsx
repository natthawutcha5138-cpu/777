import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
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
import Tasks from "@/pages/Tasks";
import Workers from "@/pages/Workers";
import Inventory from "@/pages/Inventory";
import Equipment from "@/pages/Equipment";
import NotificationsPage from "@/pages/Notifications";
import SettingsPage from "@/pages/Settings";
import LoginPage from "@/pages/LoginPage";
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
  const { user, loading, login, register, logout } = useAuth();
  const qc = useQueryClient();

  // Clear all cached queries on login/logout so data from previous user is gone
  const handleLogin = async (username: string, password: string) => {
    const err = await login(username, password);
    if (!err) qc.clear();
    return err;
  };

  const handleRegister = async (username: string, password: string, displayName: string) => {
    const err = await register(username, password, displayName);
    if (!err) qc.clear();
    return err;
  };

  const handleLogout = async () => {
    await logout();
    qc.clear();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-green-200 dark:shadow-green-900/20 animate-pulse">
            🌳
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">กำลังโหลดระบบ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout: handleLogout }}>
      <Layout user={user} onLogout={handleLogout}>
        <Switch>
          <Route path="/"           component={Dashboard} />
          <Route path="/accounting" component={Accounting} />
          <Route path="/plots"      component={Plots} />
          <Route path="/fertilizer" component={Fertilizer} />
          <Route path="/forecast"    component={Forecast} />
          <Route path="/ai-analysis" component={AIAnalysis} />
          <Route path="/tasks"      component={Tasks} />
          <Route path="/workers"    component={Workers} />
          <Route path="/inventory"  component={Inventory} />
          <Route path="/equipment"  component={Equipment} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/settings"   component={SettingsPage} />
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
