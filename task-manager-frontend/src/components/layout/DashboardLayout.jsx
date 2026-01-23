import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Brain, Target, Layers, Settings, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

const SidebarItem = ({ icon: Icon, label, href }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group",
        isActive
          ? "bg-primary/10 text-primary border-r-2 border-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-foreground")} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border/50">
            <Layers className="w-6 h-6 text-primary mr-2" />
            <span className="font-bold text-lg tracking-tight">DevJourney</span>
          </div>

          <div className="flex-1 py-6 px-3 space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
            <SidebarItem icon={Brain} label="Skill Tree" href="/skills" />
            <SidebarItem icon={Target} label="Missions" href="/missions" />
          </div>

          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">U</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">User</p>
                <p className="text-xs text-muted-foreground">Lvl 1 Novice</p>
              </div>
              <button className="text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
