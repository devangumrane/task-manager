import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { getProjectById } from "../services/projectService";
import { useProjectTasks, useUpdateTaskStatus } from "../hooks/useTasks";

import TaskCard from "../components/tasks/TaskCard";
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
  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

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

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([status, list]) => (
          <div
            key={status}
            className="bg-gray-50 p-4 rounded-lg border min-h-[200px]"
          >
            <h3 className="font-semibold mb-3">
              {status.replace("_", " ")}
            </h3>

            <div className="space-y-3">
              {list.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={(taskId, nextStatus) =>
                    updateTaskStatus.mutate({
                      taskId,
                      status: nextStatus,
                    })
                  }
                />
              ))}

              {list.length === 0 && (
                <p className="text-sm text-gray-500">No tasks</p>
              )}
            </div>
          </div>
        ))}
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
