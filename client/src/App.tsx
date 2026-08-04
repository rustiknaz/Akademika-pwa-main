import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { RoleProvider } from "./context/RoleContext";

function GlobalBackground() {
  const { bgImage, theme } = useTheme();

  if (!bgImage) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center transition-all duration-500 pointer-events-none" 
        style={{ backgroundImage: `url(${bgImage})` }} 
      />
      <div 
        className={`fixed inset-0 z-[-1] pointer-events-none transition-all duration-500 ${
          theme === 'light' ? 'bg-[#DDE2E5]/40 backdrop-blur-[2px]' : 'bg-black/30 backdrop-blur-[2px]'
        }`} 
      />
    </>
  );
}
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import Admin from "@/pages/Admin";
import AdminStudents from "@/pages/AdminStudents";
import AdminFinance from "@/pages/AdminFinance";
import AdminStaff from "@/pages/AdminStaff";
import AdminSettings from "@/pages/AdminSettings";
import AdminDirectionsManager from "@/pages/AdminDirectionsManager";
import AdminNotifications from "@/pages/AdminNotifications";
import AddClass from "@/pages/AddClass";
import EditClass from "@/pages/EditClass";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Schedule from "@/pages/Schedule";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/for-studios" component={Landing} />
      <Route path="/Login" component={Login} />
      <Route path="/Admin" component={Admin} />
      <Route path="/admin/schedule" component={Admin} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/finance" component={AdminFinance} />
      <Route path="/admin/staff" component={AdminStaff} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/directions" component={AdminDirectionsManager} />
      <Route path="/add-class" component={AddClass} />
      <Route path="/edit-class/:id" component={EditClass} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RoleProvider>
          <GlobalBackground />
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </RoleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
