import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import CentrosPage from "./pages/Centros";
import LotesPage from "./pages/Lotes";
import CalculadoraPage from "./pages/Calculadora";
import CrmPage from "./pages/Crm";
import OfertasPage from "./pages/Ofertas";
import ActividadPage from "./pages/Actividad";
import AnalisisPage from "./pages/Analisis";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/centros" component={CentrosPage} />
        <Route path="/lotes" component={LotesPage} />
        <Route path="/calculadora" component={CalculadoraPage} />
        <Route path="/crm" component={CrmPage} />
        <Route path="/ofertas" component={OfertasPage} />
        <Route path="/actividad" component={ActividadPage} />
        <Route path="/analisis" component={AnalisisPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
