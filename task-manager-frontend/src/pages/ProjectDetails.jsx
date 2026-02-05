import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import {
  Button,
  Box,
  Typography,
  Container,
  Paper,
  CircularProgress,
  IconButton
} from "@mui/material";

import { getProjectById } from "../services/projectService";
import { useProjectTasks, useUpdateTask } from "../hooks/useTasks";
import { useTaskRealtime } from "../hooks/useTaskRealtime";

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

  const updateTask = useUpdateTask(workspaceId, projectId);
  useTaskRealtime(workspaceId, projectId);

  // ---------------- NORMALIZE ----------------
  const project = rawProject?.data ?? rawProject ?? null;

  // ---------------- GUARDS ----------------
  if (loadingProject || loadingTasks) return (
    <Box display="flex" justifyContent="center" p={4}>
      <CircularProgress />
    </Box>
  );

  if (!project) return <Typography p={4}>Project not found</Typography>;

  // ---------------- UI ----------------
  return (
    <Container maxWidth="xl" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Back */}
      <Box mb={2}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(ROUTES.WORKSPACE(workspaceId))}
          color="inherit"
        >
          Back to Workspace
        </Button>
      </Box>

      {/* Header */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {project.title || project.name}
        </Typography>
      </Paper>

      {/* Tasks header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="600">Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenTaskDialog(true)}
        >
          Task
        </Button>
      </Box>

      {/* Kanban Board */}
      <Box flexGrow={1} overflow="hidden">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={(taskId, updates) =>
            updateTask.mutate({ taskId, payload: { status: updates.status } })
          }
          onTaskClick={(task) => {
            navigate(ROUTES.TASK(workspaceId, projectId, task.id));
          }}
        />
      </Box>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        workspaceId={workspaceId}
        projectId={projectId}
      />
    </Container>
  );
}
