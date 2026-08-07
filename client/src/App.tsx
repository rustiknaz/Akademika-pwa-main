import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { RoleProvider } from "./context/RoleContext";

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

// Custom GlobalBackground with dynamic image and color support
function GlobalBackground() {
  const { theme } = useTheme();
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Get background settings from localStorage
    const preset = localStorage.getItem("app_bg");
    const customBg = localStorage.getItem("app_custom_bg");
    let backgroundImage = "";
    let backgroundColor =
      theme === "light" ? "#ffffff" : "#000000";

    if (preset && preset !== "none" && preset !== "custom") {
      // For preset images: app_bg = url
      backgroundImage = `url(${preset})`;
    } else if (preset === "custom" && customBg) {
      backgroundImage = `url(${customBg})`;
    }

    setBgStyle({
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      backgroundColor,
      backgroundImage,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      transition: "background 0.3s"
    });
  }, [theme]);

  return (
    <div
      style={bgStyle}
      className="pointer-events-none transition-colors duration-300"
      aria-hidden="true"
    />
  );
}

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
  // Глобальное применение сохраненного фона приложения
  useEffect(() => {
    const applySavedBg = () => {
      const bgType = localStorage.getItem('app_bg_type');
      const bgCustom = localStorage.getItem('app_bg_custom');

      if (bgType === 'custom' && bgCustom) {
        document.body.style.backgroundImage = `url(${bgCustom})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      } else if (bgType && bgType !== 'none') {
        document.body.style.backgroundImage =
          bgType.startsWith('url') || bgType.startsWith('linear')
            ? bgType
            : `url(${bgType})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      } else {
        document.body.style.backgroundImage = '';
      }
    };

    applySavedBg();

    window.addEventListener('theme-bg-changed', applySavedBg);
    window.addEventListener('storage', applySavedBg);

    return () => {
      window.removeEventListener('theme-bg-changed', applySavedBg);
      window.removeEventListener('storage', applySavedBg);
    };
  }, []);

  // min-h-screen/w-full/relative/overflow-x-hidden/overflow-y-auto - на основном контейнере
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RoleProvider>
          <div className="min-h-screen w-full relative overflow-x-hidden overflow-y-auto">
            <GlobalBackground />
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </div>
        </RoleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
