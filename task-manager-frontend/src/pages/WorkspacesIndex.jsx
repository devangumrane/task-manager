import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listWorkspaces } from "../services/workspaceService";
import { Button } from "../components/ui/button";
import WorkspaceTable from "../components/workspaces/WorkspaceTable";
import CreateWorkspaceDialog from "../components/workspaces/CreateWorkspaceDialog";

export default function WorkspacesIndex() {
  const [openCreate, setOpenCreate] = useState(false);

  const { data: workspaces = [], isLoading, refetch } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await listWorkspaces();
      return res.data || [];
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">Manage your teams and projects.</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading workspaces...</div>
        ) : workspaces.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium">No workspaces yet</h3>
            <p className="text-muted-foreground mb-4">Create your first workspace to get started.</p>
            <Button variant="outline" onClick={() => setOpenCreate(true)}>Create Workspace</Button>
          </div>
        ) : (
          <WorkspaceTable data={workspaces} />
        )}
      </div>

      <CreateWorkspaceDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)} // Check if prop is onClose or onOpenChange
        onSuccess={() => {
          refetch();
          setOpenCreate(false);
        }}
      />
    </div>
  );
}
