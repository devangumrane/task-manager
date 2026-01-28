import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { getProjectById } from "../services/projectService";
import { useProjectTasks, useUpdateTaskStatus } from "../hooks/useTasks";

import KanbanBoard from "../components/projects/KanbanBoard";
import CreateTaskDialog from "../components/tasks/CreateTaskDialog";
import { ROUTES } from "../router/paths";

export default function ProjectDetails() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  // ---------------- DATA ----------------
  const { data: rawProject, isLoading: loadingProject } = useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: () => getProjectById(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });

  const {
    data: tasks = [],
    isLoading: loadingTasks,
  } = useProjectTasks(workspaceId, projectId);

  const updateTaskStatus = useUpdateTaskStatus(workspaceId, projectId);

  // ---------------- NORMALIZE ----------------
  const project = rawProject?.data ?? rawProject ?? null;

  // ---------------- GUARDS ----------------
  if (loadingProject || loadingTasks) return <p>Loading…</p>;
  if (!project) return <p>Project not found</p>;

  // ---------------- STRICT BACKEND ENUMS ----------------


  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(ROUTES.WORKSPACE(workspaceId))}
        className="flex items-center gap-2 text-gray-600 hover:text-black"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Header */}
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold">
          {project.title || project.name}
        </h1>
      </div>

      {/* Tasks header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <button
          onClick={() => setOpenTaskDialog(true)}
          className="px-3 py-1 bg-primary text-white rounded"
        >
          + Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="h-[calc(100vh-200px)]">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={(taskId, updates) =>
            updateTaskStatus.mutate({ taskId, status: updates.status })
          }
          onTaskClick={(task) => {
            // Optional: Open task details or dialog
            navigate(ROUTES.TASK(workspaceId, projectId, task.id));
          }}
        />
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        workspaceId={workspaceId}
        projectId={projectId}
      />
    </div>
  );
}
