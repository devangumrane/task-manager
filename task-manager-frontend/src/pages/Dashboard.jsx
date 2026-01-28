import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LayoutDashboard, Folder, CheckSquare, Users } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/dashboardService";
import { ROUTES } from "../router/paths";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const statItems = [
    { label: "Active Workspaces", value: stats?.workspaces ?? "-", icon: Users, color: "text-blue-500" },
    { label: "Projects", value: stats?.projects ?? "-", icon: Folder, color: "text-emerald-500" },
    { label: "Pending Tasks", value: stats?.pendingTasks ?? "-", icon: CheckSquare, color: "text-orange-500" },
    { label: "Completed", value: stats?.completedTasks ?? "-", icon: LayoutDashboard, color: "text-primary" },
  ];

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"}!</h1>
        <p className="text-muted-foreground mt-2">Here is an overview of your projects and tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => (
          <Card key={stat.label} className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="col-span-2 bg-card/50 backdrop-blur border-primary/10">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link to={ROUTES.WORKSPACES} className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-semibold">My Workspaces</h3>
                <p className="text-sm text-muted-foreground">Manage teams and permissions</p>
              </div>
            </Link>

            <Link to={ROUTES.PROJECTS} className="p-4 rounded-lg bg-teal-500/5 hover:bg-teal-500/10 border border-transparent hover:border-teal-500/20 transition-all flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600">
                <Folder size={20} />
              </div>
              <div>
                <h3 className="font-semibold">All Projects</h3>
                <p className="text-sm text-muted-foreground">View progress and timelines</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* System Status / Info */}
        <Card className="bg-card/50 backdrop-blur border-primary/10">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Server</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-600"></span> Online
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground">v1.2.0 (Pro)</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground">Need help? Contact system administrator.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
