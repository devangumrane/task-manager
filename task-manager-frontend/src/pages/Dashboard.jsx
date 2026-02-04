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
  Button
} from "@mui/material";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  Group as UsersIcon // Lucide 'Users' conflicts with 'User' model conceptually but fine here
} from "lucide-react";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const statItems = [
    { label: "Active Workspaces", value: stats?.workspaces ?? "-", icon: UsersIcon, color: "#3b82f6" },
    { label: "Projects", value: stats?.projects ?? "-", icon: Folder, color: "#10b981" },
    { label: "Pending Tasks", value: stats?.pendingTasks ?? "-", icon: CheckSquare, color: "#f97316" },
    { label: "Completed", value: stats?.completedTasks ?? "-", icon: LayoutDashboard, color: "#2563eb" },
  ];

  if (isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome back, {user?.name || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is an overview of your projects and tasks.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statItems.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="text.secondary" variant="subtitle2">
                  {stat.label}
                </Typography>
                <stat.icon size={20} color={stat.color} />
              </Box>
              <Typography component="p" variant="h4" fontWeight="bold">
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Actions & Status */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Access
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to={ROUTES.WORKSPACES}
                  variant="outlined"
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    p: 2,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' }
                  }}
                  startIcon={<UsersIcon size={20} />}
                >
                  <Box textAlign="left">
                    <Typography variant="subtitle1" fontWeight="bold">My Workspaces</Typography>
                    <Typography variant="caption" color="text.secondary">Manage teams and permissions</Typography>
                  </Box>
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  component={RouterLink}
                  to={ROUTES.PROJECTS}
                  variant="outlined"
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    p: 2,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': { borderColor: 'teal', bgcolor: 'teal.lighter' } // teal not in default theme but fine
                  }}
                  startIcon={<Folder size={20} />}
                >
                  <Box textAlign="left">
                    <Typography variant="subtitle1" fontWeight="bold">All Projects</Typography>
                    <Typography variant="caption" color="text.secondary">View progress and timelines</Typography>
                  </Box>
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Server</Typography>
                <Typography variant="body2" color="success.main" fontWeight="medium">
                  ● Online
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Version</Typography>
                <Typography variant="body2">v1.2.0 (Pro)</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
