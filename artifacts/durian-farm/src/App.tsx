import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Accounting from "@/pages/Accounting";
import Plots from "@/pages/Plots";
import Fertilizer from "@/pages/Fertilizer";
import Forecast from "@/pages/Forecast";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function AuthGate() {
  const { user, loading, login, register, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={login} onRegister={register} />;

  return (
    <Layout user={user} onLogout={logout}>
      <Switch>
        <Route path="/"           component={Dashboard} />
        <Route path="/accounting" component={Accounting} />
        <Route path="/plots"      component={Plots} />
        <Route path="/fertilizer" component={Fertilizer} />
        <Route path="/forecast"   component={Forecast} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthGate />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
