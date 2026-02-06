import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Settings } from "lucide-react";
import { getProjectById } from "../services/projectService";
import { useProjectTasks, useUpdateTask } from "../hooks/useTasks";
import { useTaskRealtime } from "../hooks/useTaskRealtime";
import KanbanBoard from "../components/projects/KanbanBoard";
import CreateTaskDialog from "../components/tasks/CreateTaskDialog";
import { ROUTES } from "../router/paths";
import { motion } from "framer-motion";
import GlassCard from "../components/shared/GlassCard";

export default function ProjectDetails() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  const { data: rawProject, isLoading: loadingProject } = useQuery({
    queryKey: ["project", workspaceId, projectId],
    queryFn: () => getProjectById(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });

  const { data: tasks = [], isLoading: loadingTasks } = useProjectTasks(workspaceId, projectId);
  const updateTask = useUpdateTask(workspaceId, projectId);
  useTaskRealtime(workspaceId, projectId);

  const project = rawProject?.data ?? rawProject ?? null;

  if (loadingProject || loadingTasks) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!project) return <div className="p-8 text-center">Project not found</div>;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.WORKSPACE(workspaceId))}
            className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1">{project.title || project.name}</h1>
            <p className="text-muted-foreground text-sm">{project.description || "Manage your project tasks"}</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <Settings size={20} />
            </button>
            <button
              onClick={() => setOpenTaskDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-lg shadow-primary/25 transition-all"
            >
              <Plus size={20} /> New Task
            </button>
          </div>
        </motion.div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/5 bg-black/20">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={(taskId, updates) =>
            updateTask.mutate({ taskId, payload: { status: updates.status } })
          }
          onTaskClick={(task) => {
            navigate(ROUTES.TASK(workspaceId, projectId, task.id));
          }}
        />
      </div>

      <CreateTaskDialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        workspaceId={workspaceId}
        projectId={projectId}
      />
    </div>
  );
}
