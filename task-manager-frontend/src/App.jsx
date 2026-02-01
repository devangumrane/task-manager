import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { ROUTES } from "./router/paths";

import AppShell from "./components/layout/AppShell";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// import Dashboard from "./pages/Dashboard"; // We might rename this to ProjectsIndex eventually
import ProjectsIndex from "./pages/ProjectsIndex"; // Renaming dashboard to projects list usually
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";

import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";

/* ---------------- PROTECTED LAYOUT ---------------- */

function ProtectedLayout() {
  const token = useAuthStore((s) => s.accessToken);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
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
        <Route index element={<ProjectsIndex />} /> {/* Dashboard is now just Project List */}

        <Route path={ROUTES.PROJECTS} element={<ProjectsIndex />} />
        <Route
          path="/projects/:projectId"
          element={<ProjectDetails />}
        />
        <Route
          path="/projects/:projectId/tasks/:taskId"
          element={<TaskDetails />}
        />

        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path="/users/:id" element={<UserProfile />} />

        {/* Legacy redirect */}
        <Route path="/workspaces/*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}
