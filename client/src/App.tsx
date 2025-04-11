import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/Dashboard";
import Plants from "@/pages/Plants";
import Calendar from "@/pages/Calendar";
import Tasks from "@/pages/Tasks";
import PlantScanner from "@/pages/PlantScanner";
import VoiceAssistant from "@/pages/VoiceAssistant";
import Hardware from "@/pages/Hardware";
import MainLayout from "@/layouts/MainLayout";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardWithLayout} />
      <ProtectedRoute path="/plants" component={PlantsWithLayout} />
      <ProtectedRoute path="/calendar" component={CalendarWithLayout} />
      <ProtectedRoute path="/tasks" component={TasksWithLayout} />
      <ProtectedRoute path="/plant-scanner" component={PlantScannerWithLayout} />
      <ProtectedRoute path="/voice-assistant" component={VoiceAssistantWithLayout} />
      <ProtectedRoute path="/hardware" component={HardwareWithLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Wrapper components for protected routes with MainLayout
function DashboardWithLayout() {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}

function PlantsWithLayout() {
  return (
    <MainLayout>
      <Plants />
    </MainLayout>
  );
}

function CalendarWithLayout() {
  return (
    <MainLayout>
      <Calendar />
    </MainLayout>
  );
}

function TasksWithLayout() {
  return (
    <MainLayout>
      <Tasks />
    </MainLayout>
  );
}

function PlantScannerWithLayout() {
  return (
    <MainLayout>
      <PlantScanner />
    </MainLayout>
  );
}

function VoiceAssistantWithLayout() {
  return (
    <MainLayout>
      <VoiceAssistant />
    </MainLayout>
  );
}

function HardwareWithLayout() {
  return (
    <MainLayout>
      <Hardware />
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
