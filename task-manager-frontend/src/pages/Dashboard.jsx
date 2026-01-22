import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaces } from "../hooks/useWorkspaces";
import WorkspaceTable from "../components/workspaces/WorkspaceTable";
import CreateWorkspaceDialog from "../components/workspaces/CreateWorkspaceDialog";
import ThemeToggle from "../components/ThemeToggle";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/authStore";
import { ROUTES } from "../router/paths";

export default function Dashboard() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  const { data: workspaces = [], isLoading } = useWorkspaces();

  // FIX: normalize backend response shape
  // const workspaces = Array.isArray(data?.data) ? data.data : [];

  const [openDialog, setOpenDialog] = useState(false);

  const handleRowClick = (workspace) => {
    navigate(ROUTES.WORKSPACE(workspace.id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="font-semibold text-lg">Task Manager</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearAuth();
              navigate("/login", { replace: true });
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Workspaces</h2>
            <p className="text-xs text-muted-foreground">
              Select a workspace to view its projects and tasks.
            </p>
          </div>
          <Button size="sm" onClick={() => setOpenDialog(true)}>
            + Workspace
          </Button>
        </div>

        <WorkspaceTable
          workspaces={workspaces}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />

        <CreateWorkspaceDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        />
      </main>
    </div>
  );
}
