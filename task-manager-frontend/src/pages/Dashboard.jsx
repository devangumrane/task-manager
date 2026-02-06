import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Users, FileText, CheckCircle, Target, Activity, ArrowUpRight, Clock, Zap } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/dashboardService";
import GlassCard from "../components/shared/GlassCard";
import Skeleton from "../components/shared/Skeleton";
import { motion } from "framer-motion";

const COLORS = ["#f97316", "#3b82f6", "#10b981"]; // Orange, Blue, Emerald

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const stats = data?.data;

  const chartData = [
    { name: "Pending", value: stats?.tasks?.pending || 0 },
    { name: "Completed", value: stats?.tasks?.completed || 0 },
  ];

  // Mock trend data for the area chart since we don't have it yet
  const trendData = [
    { name: 'Mon', tasks: 12 },
    { name: 'Tue', tasks: 19 },
    { name: 'Wed', tasks: 15 },
    { name: 'Thu', tasks: 22 },
    { name: 'Fri', tasks: 30 },
    { name: 'Sat', tasks: 25 },
    { name: 'Sun', tasks: 35 },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-foreground mb-2"
          >
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400">{user?.name || "User"}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Here's what's happening in your digital workspace today.
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
        >
          <Zap size={18} />
          Quick Action
        </motion.button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Stat Cards */}
        <StatCard
          title="Workspaces"
          value={stats?.workspaces || 0}
          icon={Users}
          color="text-violet-500 dark:text-violet-400"
          bg="bg-violet-500/10"
          delay={0.1}
        />
        <StatCard
          title="Active Projects"
          value={stats?.projects || 0}
          icon={FileText}
          color="text-blue-500 dark:text-blue-400"
          bg="bg-blue-500/10"
          delay={0.2}
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.tasks?.pending || 0}
          icon={Target}
          color="text-orange-500 dark:text-orange-400"
          bg="bg-orange-500/10"
          delay={0.3}
        />
        <StatCard
          title="Completed"
          value={stats?.tasks?.completed || 0}
          icon={CheckCircle}
          color="text-emerald-500 dark:text-emerald-400"
          bg="bg-emerald-500/10"
          delay={0.4}
        />

        {/* Charts & Graphs */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="h-[350px] flex flex-col">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Activity className="text-primary w-5 h-5" />
              Task Volume Trend
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#151A23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="h-[350px] flex flex-col">
            <h3 className="font-semibold text-lg mb-4">Completion Status</h3>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#151A23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-foreground">{stats?.tasks?.total || 0}</span>
                <span className="text-sm text-muted-foreground">Total Tasks</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Activity Feed (Sidebar on Desktop) */}
        <div className="lg:col-span-1">
          <GlassCard className="h-[724px] overflow-hidden flex flex-col">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Clock className="text-primary w-5 h-5" />
              Recent Activity
            </h3>
            <div className="overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              {stats?.activities?.length > 0 ? (
                stats.activities.map((activity, index) => (
                  <div key={activity.id} className="relative pl-6 pb-2 group">
                    {/* Timeline Line */}
                    {index !== stats.activities.length - 1 && (
                      <div className="absolute left-[9px] top-8 bottom-[-24px] w-[2px] bg-white/5 dark:bg-white/5 bg-black/5 group-hover:bg-primary/30 transition-colors" />
                    )}

                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full border border-white/10 dark:border-white/10 border-black/10 bg-card flex items-center justify-center group-hover:border-primary/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-sm">
                        <span className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer">{activity.user?.name}</span>
                        <span className="text-muted-foreground">
                          {activity.type === 'task.created' && ' created task '}
                          {activity.type === 'task.updated' && ' updated '}
                          {activity.type === 'task.completed' && ' completed '}
                          {activity.type === 'comment.created' && ' commented on '}
                        </span>
                        <span className="font-medium text-foreground">
                          {activity.task?.title ? `"${activity.task.title}"` : 'a task'}
                        </span>
                      </p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <GlassCard hoverEffect className="flex items-center justify-between p-6 h-full">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{value}</span>
            {/* Mock Trend - Could be real later */}
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <ArrowUpRight size={12} strokeWidth={3} /> +12%
            </span>
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${bg} ${color} flex items-center justify-center shadow-inner`}>
          <Icon size={28} />
        </div>
      </GlassCard>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} className="p-6 h-32 flex justify-between items-center">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-14 w-14 rounded-2xl" />
          </GlassCard>
        ))}

        <GlassCard className="lg:col-span-3 h-[350px]">
          <Skeleton className="h-full w-full" />
        </GlassCard>

        <GlassCard className="h-[350px]">
          <Skeleton className="h-full w-full" />
        </GlassCard>

        <GlassCard className="lg:col-span-1 h-[724px]">
          <Skeleton className="h-full w-full" />
        </GlassCard>
      </div>
    </div>
  )
}
