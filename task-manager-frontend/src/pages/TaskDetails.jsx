import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, getTaskAttachments } from "../services/taskService";
import { getReminders, createReminder, deleteReminder } from "../services/reminderService";
import { ArrowLeft, Plus } from "lucide-react";
import { ROUTES } from "../router/paths";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Link,
  IconButton,
  Container,
  CircularProgress
} from "@mui/material";

import ReminderList from "../components/reminders/ReminderList";
import CreateReminderDialog from "../components/reminders/CreateReminderDialog";
import ConfirmDialog from "../components/shared/ConfirmDialog";

export default function TaskDetails() {
  const { workspaceId, projectId, taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // 1. Fetch Task
  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ["task", workspaceId, projectId, taskId],
    queryFn: () => getTaskById(workspaceId, projectId, taskId),
  });

  // 2. Fetch Attachments
  const { data: attachments, isLoading: loadingAttachments } = useQuery({
    queryKey: ["taskAttachments", workspaceId, projectId, taskId],
    queryFn: () => getTaskAttachments(workspaceId, projectId, taskId),
  });

  // 3. Fetch Reminders
  const { data: reminders, isLoading: loadingReminders } = useQuery({
    queryKey: ["taskReminders", workspaceId, projectId, taskId],
    queryFn: () => getReminders(workspaceId, projectId, taskId),
  });

  // Mutations
  const createReminderMutation = useMutation({
    mutationFn: (data) => createReminder(workspaceId, projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["taskReminders", workspaceId, projectId, taskId]);
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id) => deleteReminder(workspaceId, projectId, taskId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(["taskReminders", workspaceId, projectId, taskId]);
      setDeleteId(null);
    },
  });

  if (loadingTask) return (
    <Box p={8} display="flex" justifyContent="center">
      <CircularProgress />
    </Box>
  );
  if (!task) return <Typography p={8}>Task not found.</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4, animation: 'fadeIn 0.5s' }}>
      {/* Back Button */}
      <Box mb={2}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(ROUTES.TASK(workspaceId, projectId, task.id).replace('tasks/' + task.id, ''))} // navigate back to project
          color="inherit"
        >
          Back to Project
        </Button>
      </Box>

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Task Details + Attachments */}
        <Grid xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card variant="outlined" sx={{ boxShadow: 0 }}>
            <CardHeader
              title={
                <Box>
                  <Typography variant="h5" fontWeight="bold">{task.title}</Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={task.status} size="small" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} />
                    <Chip label={task.priority} size="small" color="primary" variant="outlined" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} />
                  </Box>
                </Box>
              }
            />
            <CardContent>
              <Box className="prose prose-sm dark:prose-invert max-w-none" mb={3}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                  {task.description || "No description provided."}
                </Typography>
              </Box>

              <Box borderTop={1} borderColor="divider" pt={2} display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Due Date</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card variant="outlined">
            <CardHeader title={<Typography variant="h6">Attachments</Typography>} />
            <CardContent>
              {loadingAttachments ? (
                <Typography variant="body2" color="text.secondary">Loading attachments…</Typography>
              ) : attachments?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">No attachments.</Typography>
              ) : (
                <Box display="flex" flexDirection="column" gap={1}>
                  {attachments.map((file) => (
                    <Box
                      key={file.id}
                      p={2}
                      bgcolor="action.hover"
                      borderRadius={1}
                      border={1}
                      borderColor="divider"
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">{file.filename}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                          {file.mimetype.split('/')[1]}
                        </Typography>
                      </Box>
                      <Link
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        variant="body2"
                        fontWeight="medium"
                      >
                        Download
                      </Link>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Reminders (Side Panel) */}
        <Grid xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card variant="outlined">
            <CardHeader
              title={<Typography variant="h6">Reminders</Typography>}
              action={
                <IconButton onClick={() => setIsReminderDialogOpen(true)}>
                  <Plus size={20} />
                </IconButton>
              }
            />
            <CardContent>
              {loadingReminders ? (
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              ) : (
                <ReminderList
                  reminders={reminders || []}
                  onDelete={setDeleteId}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <CreateReminderDialog
        open={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        onSubmit={(data) => createReminderMutation.mutateAsync(data)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Reminder?"
        description="This will remove the notification. You cannot undo this."
        destructive
        onConfirm={() => deleteReminderMutation.mutate(deleteId)}
      />
    </Container>
  );
}
