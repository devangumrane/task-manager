import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ROUTES } from "./router/paths";

import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Dashboard from "./pages/Dashboard";
import WorkspacesIndex from "./pages/WorkspacesIndex";
import WorkspaceDetails from "./pages/WorkspaceDetails";

import ProjectsIndex from "./pages/ProjectsIndex";
import ProjectDetails from "./pages/ProjectDetails";

import TaskDetails from "./pages/TaskDetails";
import ActivityPage from "./pages/ActivityPage";

import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";

/* ---------------- PROTECTED LAYOUT ---------------- */

function ProtectedLayout() {
  const token = useAuthStore((s) => s.accessToken);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

/* ---------------- APP ROUTES ---------------- */

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />

      {/* Protected */}
      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />

        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path="/users/:id" element={<UserProfile />} />

        <Route path={ROUTES.WORKSPACES} element={<WorkspacesIndex />} />
        <Route
          path={`${ROUTES.WORKSPACES}/:workspaceId`}
          element={<WorkspaceDetails />}
        />

        <Route path={ROUTES.PROJECTS} element={<ProjectsIndex />} />
        <Route
          path={`${ROUTES.WORKSPACES}/:workspaceId/projects/:projectId`}
          element={<ProjectDetails />}
        />

        <Route
          path={`${ROUTES.WORKSPACES}/:workspaceId/projects/:projectId/tasks/:taskId`}
          element={<TaskDetails />}
        />

        <Route
          path="/workspaces/:workspaceId/activity"
          element={<ActivityPage />}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}
