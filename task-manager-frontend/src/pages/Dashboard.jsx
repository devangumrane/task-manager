import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { Users, FileText, CheckCircle, Target, Activity } from "lucide-react"; // Replaced Folder with FileText, etc.

// ... existing imports ...
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/dashboardService";
import { ROUTES } from "../router/paths";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Chip
} from "@mui/material";

// ... icons ...

const COLORS = ["#f97316", "#2563eb", "#10b981"]; // Orange (Pending), Blue (Completed)

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const stats = data?.data; // Structure is { workspaces, projects, tasks: { total, pending, completed }, activities: [] }

  const chartData = [
    { name: "Pending", value: stats?.tasks?.pending || 0 },
    { name: "Completed", value: stats?.tasks?.completed || 0 },
  ];

  if (isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, animation: 'fadeIn 0.5s' }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome back, {user?.name || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is what's happening in your workspaces.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Workspaces</Typography>
              <Typography variant="h4" fontWeight="bold">{stats?.workspaces || 0}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}><Users size={24} /></Avatar>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Projects</Typography>
              <Typography variant="h4" fontWeight="bold">{stats?.projects || 0}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}><FileText size={24} /></Avatar>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Pending Tasks</Typography>
              <Typography variant="h4" fontWeight="bold">{stats?.tasks?.pending || 0}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main' }}><Target size={24} /></Avatar>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Completed</Typography>
              <Typography variant="h4" fontWeight="bold">{stats?.tasks?.completed || 0}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'info.light', color: 'info.main' }}><CheckCircle size={24} /></Avatar>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Charts Section */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader title="Task Status Overview" />
            <Divider />
            <CardContent sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {stats?.tasks?.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box textAlign="center" color="text.secondary">
                  <Typography>No task data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity Feed */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: '100%', maxHeight: 400, overflow: 'auto' }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <Activity size={20} />
                  <Typography variant="h6">Recent Activity</Typography>
                </Box>
              }
            />
            <Divider />
            <List dense>
              {stats?.activities?.length > 0 ? (
                stats.activities.map((activity, index) => (
                  <div key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar
                          src={activity.user?.profile_image ? `${import.meta.env.VITE_API_URL}${activity.user.profile_image}` : null}
                          alt={activity.user?.name}
                          sx={{ width: 32, height: 32, fontSize: 12 }}
                        >
                          {activity.user?.name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" component="span" fontWeight="medium">
                            {activity.user?.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" color="text.secondary" component="span" display="block">
                              {/* Basic parser for activity types */}
                              {activity.type === 'task.created' && `created task "${activity.task?.title || 'Unknown'}"`}
                              {activity.type === 'task.updated' && `updated task "${activity.task?.title || 'Unknown'}"`}
                              {activity.type === 'task.completed' && `completed task "${activity.task?.title || 'Unknown'}"`}
                              {activity.type === 'comment.created' && `commented on "${activity.task?.title || 'Unknown'}"`}
                              {!activity.task && activity.type}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })} in {activity.project?.name}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < stats.activities.length - 1 && <Divider component="li" />}
                  </div>
                ))
              ) : (
                <Box p={3} textAlign="center">
                  <Typography variant="body2" color="text.secondary">No recent activity.</Typography>
                </Box>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
