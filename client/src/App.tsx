import React, { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { RoleProvider } from "./context/RoleContext";
import BottomNav from "@/components/BottomNav";

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
import AdminServices from "@/pages/AdminServices";
import AdminMarketing from "@/pages/AdminMarketing";
import AdminMessages from "@/pages/AdminMessages";
import AdminAiHub from "@/pages/AdminAiHub";

function GlobalBackground() {
  const { theme, bgImage } = useTheme();
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const backgroundImage = bgImage ? `url(${bgImage})` : "";
    const backgroundColor = bgImage ? "transparent" : (theme === "light" ? "#ffffff" : "#000000");

    setBgStyle({
      position: "fixed",
      inset: 0,
      zIndex: -10,
      backgroundColor,
      backgroundImage,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat",
      transition: "background 0.3s",
      mixBlendMode: "normal"
    });
  }, [theme, bgImage]);

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
    <>
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
        <Route path="/admin/services" component={AdminServices} />
        <Route path="/admin/memberships" component={AdminServices} />
        <Route path="/admin/messages" component={AdminMessages} />
        <Route path="/admin/ai" component={AdminAiHub} />
        <Route path="/admin/marketing" component={AdminAiHub} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RoleProvider>
          <div className="min-h-screen w-full relative overflow-x-hidden overflow-y-auto" style={{ backgroundColor: 'transparent' }}>
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