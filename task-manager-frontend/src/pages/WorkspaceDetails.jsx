import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import { Button } from "../components/ui/button";
import CreateProjectDialog from "../components/projects/CreateProjectDialog";
import { ROUTES } from "../router/paths";

export default function WorkspaceDetails() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useProjects(workspaceId);
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Button onClick={() => setOpenDialog(true)}>+ Project</Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="cursor-pointer p-3 bg-card rounded-lg border hover:bg-secondary"
              onClick={() => navigate(ROUTES.PROJECT(workspaceId, project.id))}
            >
              {project.name}
            </li>
          ))}
        </ul>
      )}

      <CreateProjectDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
}
