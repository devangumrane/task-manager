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
  const { projectId } = useParams();
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  // ---------------- DATA ----------------
  // We can switch to useProject hook later, but for now update this query
  const { data: rawProject, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
  });

  const {
    data: tasks = [],
    isLoading: loadingTasks,
  } = useProjectTasks(projectId);

  const updateTaskStatus = useUpdateTaskStatus(projectId);

  // ---------------- NORMALIZE ----------------
  const project = rawProject?.data ?? rawProject ?? null;

  // ---------------- GUARDS ----------------
  if (loadingProject || loadingTasks) return <p className="p-8">Loading…</p>;
  if (!project) return <p className="p-8">Project not found</p>;

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(ROUTES.PROJECTS)}
        className="flex items-center gap-2 text-gray-600 hover:text-black"
      >
        <ArrowLeft size={20} />
        Back to Projects
      </button>

      {/* Header */}
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold">
          {project.title || project.name}
        </h1>
        {project.description && (
          <p className="text-gray-500 mt-2">{project.description}</p>
        )}
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
      <div className="h-[calc(100vh-300px)]">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={(taskId, updates) =>
            updateTaskStatus.mutate({ taskId, status: updates.status })
          }
          onTaskClick={(task) => {
            navigate(ROUTES.TASK(projectId, task.id));
          }}
        />
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        projectId={projectId}
      />
    </div>
  );
}
