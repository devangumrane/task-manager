import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Home, Folder, Layers, FileText } from "lucide-react";
import { ROUTES } from "../../router/paths";

import { useWorkspace } from "../../hooks/useWorkspaces";
import { useProject } from "../../hooks/useProjects";
import { useTask } from "../../hooks/useTasks";

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { workspaceId, projectId, taskId } = useParams();

  const { data: workspace, isLoading: loadingWs } = useWorkspace(workspaceId);
  const { data: project, isLoading: loadingPr } = useProject(workspaceId, projectId);
  const { data: task, isLoading: loadingTk } = useTask(workspaceId, projectId, taskId);

  const crumbs = [];

  // Dashboard
  crumbs.push({
    label: "Dashboard",
    to: ROUTES.DASHBOARD,
    icon: <Home size={16} />,
  });

  // Workspaces
  if (pathname.startsWith(ROUTES.WORKSPACES)) {
    crumbs.push({
      label: "Workspaces",
      to: ROUTES.WORKSPACES,
      icon: <Layers size={16} />,
    });

    if (workspaceId) {
      crumbs.push({
        label: loadingWs ? "Loading..." : workspace?.name,
        to: ROUTES.WORKSPACE(workspaceId),
        icon: <Folder size={16} />,
      });
    }
  }

  // Projects
  if (pathname.includes("/projects")) {
    crumbs.push({
      label: "Projects",
      to: ROUTES.PROJECTS,
      icon: <Layers size={16} />,
    });

    if (projectId) {
      crumbs.push({
        label: loadingPr ? "Loading..." : project?.title,
        to: ROUTES.PROJECT(workspaceId, projectId),
        icon: <Folder size={16} />,
      });
    }
  }

  // Tasks
  if (pathname.includes("/tasks")) {
    crumbs.push({
      label: loadingTk ? "Loading..." : `Task: ${task?.title}`,
      to: ROUTES.TASK(workspaceId, projectId, taskId),
      icon: <FileText size={16} />,
    });
  }

  return (
    <nav className="text-sm flex items-center gap-1 mb-4 select-none">
      {crumbs.map((c, i) => (
        <div key={i} className="flex items-center gap-1">
          
          {/* crumb */}
          <Link
            to={c.to}
            className="
              flex items-center gap-1 px-2 py-1 rounded 
              hover:bg-muted/50 transition-all duration-150
              text-foreground/80 hover:text-foreground
            "
          >
            {c.icon}
            <span>{c.label}</span>
          </Link>

          {/* arrow */}
          {i < crumbs.length - 1 && (
            <ChevronRight size={14} className="text-muted-foreground/50" />
          )}
        </div>
      ))}
    </nav>
  );
}
