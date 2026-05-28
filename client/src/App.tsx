import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { lazy, Suspense } from "react";

const AppDashboard = lazy(() => import("./pages/AppDashboard"));
const ProjectView = lazy(() => import("./pages/ProjectView"));
const TgsEditor = lazy(() => import("./pages/TgsEditor"));
const JoinProject = lazy(() => import("./pages/JoinProject"));

// For GitHub Pages, we need to handle the subfolder path
const base = "/traffic-designer-clone";

function Router() {
  return (
    <WouterRouter base={base}>
      <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /></div>}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/features" component={Features} />
          <Route path="/app" component={AppDashboard} />
          <Route path="/app/project/:id" component={ProjectView} />
          <Route path="/app/editor/:planId" component={TgsEditor} />
          <Route path="/app/join/:token" component={JoinProject} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
