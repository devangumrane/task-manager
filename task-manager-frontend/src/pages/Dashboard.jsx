import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Activity, Award, Flame, Zap } from "lucide-react";
import { gamificationService } from "../services/gamificationService";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationService.getStats()
      .then(data => {
        setStats(data);
      })
      .catch(err => console.error("Failed to fetch stats", err))
      .finally(() => setLoading(false));
  }, []);

  const statItems = [
    { label: "Total XP", value: stats?.totalXP || 0, icon: Zap, color: "text-amber-400" },
    { label: "Current Level", value: `Lvl ${stats?.currentLevel || 1}`, icon: Award, color: "text-primary" },
    { label: "Day Streak", value: `${stats?.currentStreak || 0} Days`, icon: Flame, color: "text-orange-500" },
    { label: "Completion Rate", value: "0%", icon: Activity, color: "text-emerald-400" },
  ];

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading command center...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">Ready to continue your learning mission?</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat) => (
          <Card key={stat.label} className="bg-card/50 backdrop-blur border-primary/10 transition-all hover:border-primary/30">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur border-primary/10">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-md bg-muted/10">
              No recent activity logs found. Start a mission!
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/50 backdrop-blur border-primary/10">
          <CardHeader>
            <CardTitle>Next Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Recommended</span>
                  <span className="text-xs text-muted-foreground">100 XP</span>
                </div>
                <h3 className="font-semibold text-lg">Backend Basics</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">Complete your first specialized backend mission.</p>
                <button className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors">
                  Find Missions
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
