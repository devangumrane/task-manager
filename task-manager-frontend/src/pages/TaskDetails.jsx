import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, getTaskAttachments } from "../services/taskService";
import { getReminders, createReminder, deleteReminder } from "../services/reminderService";
import { ArrowLeft, Plus, Trash, Save, X, Edit2, MessageSquare } from "lucide-react";
import { useDeleteTask, useUpdateTask } from "../hooks/useTasks";
import { useTaskRealtime } from "../hooks/useTaskRealtime";
import { useComments } from "../hooks/useComments";
import { ROUTES } from "../router/paths";
import Editor from "../components/shared/Editor";
import CommentList from "../components/comments/CommentList";
import CommentForm from "../components/comments/CommentForm";
import Checklist from "../components/tasks/Checklist";
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
import AttachmentUploader from "../components/attachments/AttachmentUploader";

export default function TaskDetails() {
  const { workspaceId, projectId, taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Enable Realtime
  useTaskRealtime(workspaceId, projectId, Number(taskId));

  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [deleteReminderId, setDeleteReminderId] = useState(null);
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);

  // Mutations
  const deleteTaskMutation = useDeleteTask(workspaceId, projectId);
  const updateTaskMutation = useUpdateTask(workspaceId, projectId);

  const { comments, isLoading: loadingComments, createComment, deleteComment } = useComments(workspaceId, projectId, taskId);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState("");

  // Sync state
  useEffect(() => {
    if (task) setDescriptionContent(task.description || "");
  }, [task]);

  const handleSaveDescription = () => {
    updateTaskMutation.mutate({
      taskId: Number(taskId),
      payload: { description: descriptionContent }
    }, {
      onSuccess: () => setIsEditingDescription(false)
    });
  };

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
      setDeleteReminderId(null);
    },
  });

  const handleDeleteTask = () => {
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => {
        navigate(ROUTES.PROJECT(workspaceId, projectId));
      },
    });
  };

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
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Typography variant="h5" fontWeight="bold">{task.title}</Typography>
                    <Box>
                      <IconButton color="error" onClick={() => setShowDeleteTaskConfirm(true)} title="Delete Task">
                        <Trash size={18} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip label={task.status} size="small" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} />
                    <Chip label={task.priority} size="small" color="primary" variant="outlined" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} />
                  </Box>
                </Box>
              }
            />
            <CardContent>
              <Box mb={1} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                  DESCRIPTION
                </Typography>
                {!isEditingDescription ? (
                  <Button
                    size="small"
                    startIcon={<Edit2 size={14} />}
                    onClick={() => setIsEditingDescription(true)}
                    variant="text"
                  >
                    Edit
                  </Button>
                ) : (
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      startIcon={<X size={14} />}
                      onClick={() => {
                        setIsEditingDescription(false);
                        setDescriptionContent(task.description || "");
                      }}
                      variant="outlined"
                      color="inherit"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Save size={14} />}
                      onClick={handleSaveDescription}
                      variant="contained"
                      disabled={updateTaskMutation.isPending}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>

              <Box>
                {isEditingDescription ? (
                  <Editor
                    value={descriptionContent}
                    onChange={setDescriptionContent}
                  />
                ) : (
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: task.description || "<p>No description provided.</p>" }}
                  />
                )}
              </Box>

              <Box borderTop={1} borderColor="divider" mt={3} pt={2} display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Due Date</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No due date"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Assigned To</Typography>
                  {task.assignee ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="medium">{task.assignee.name || task.assignee.email}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">Unassigned</Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Subtasks Section */}
          <Card variant="outlined">
            <CardContent>
              <Checklist workspaceId={workspaceId} projectId={projectId} taskId={taskId} />
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card variant="outlined">
            <CardHeader title={<Typography variant="h6">Attachments</Typography>} />
            <CardContent>
              <Box mb={3}>
                <AttachmentUploader workspaceId={workspaceId} projectId={projectId} taskId={taskId} />
              </Box>

              {loadingAttachments ? (
                <Typography variant="body2" color="text.secondary">Loading attachments…</Typography>
              ) : attachments?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">No attachments yet.</Typography>
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

          {/* Comments Section */}
          <Card variant="outlined">
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={2}>
                  <MessageSquare size={20} className="text-gray-500" />
                  <Typography variant="h6">Comments</Typography>
                </Box>
              }
            />
            <CardContent>
              <Box mb={3}>
                <CommentForm
                  onSubmit={(content) => createComment.mutate(content)}
                  disabled={createComment.isPending}
                />
              </Box>
              {loadingComments ? (
                <Typography variant="body2" color="text.secondary">Loading comments...</Typography>
              ) : (
                <CommentList
                  comments={comments || []}
                  onDelete={(id) => deleteComment.mutate(id)}
                />
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
                  onDelete={setDeleteReminderId}
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
        open={!!deleteReminderId}
        onOpenChange={(open) => !open && setDeleteReminderId(null)}
        title="Delete Reminder?"
        description="This will remove the notification. You cannot undo this."
        destructive
        onConfirm={() => deleteReminderMutation.mutate(deleteReminderId)}
      />

      {/* Delete Task Dialog */}
      <ConfirmDialog
        open={showDeleteTaskConfirm}
        onOpenChange={setShowDeleteTaskConfirm}
        title="Delete Task?"
        description="Are you sure you want to delete this task? This cannot be undone."
        destructive
        onConfirm={handleDeleteTask}
      />
    </Container>
  );
}
