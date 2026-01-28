import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, getTaskAttachments } from "../services/taskService";
import { getReminders, createReminder, deleteReminder } from "../services/reminderService";
import { ArrowLeft, Plus } from "lucide-react";
import { ROUTES } from "../router/paths";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

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

  if (loadingTask) return <p className="p-8">Loading task…</p>;
  if (!task) return <p className="p-8">Task not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate(ROUTES.TASK(workspaceId, projectId, task.id).replace('tasks/' + task.id, ''))} // navigate back to project
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Project
      </button>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Task Details + Attachments */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-none border bg-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{task.title}</h1>
                  <div className="flex gap-2 mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="px-2 py-1 bg-secondary rounded">{task.status}</span>
                    <span className="px-2 py-1 bg-secondary rounded">{task.priority}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{task.description || "No description provided."}</p>
              </div>
              <div className="text-sm border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs">Due Date</span>
                  <span className="font-medium">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAttachments ? (
                <p className="text-sm text-muted-foreground">Loading attachments…</p>
              ) : attachments?.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No attachments.</p>
              ) : (
                <div className="space-y-3">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">{file.filename}</p>
                        <p className="text-xs text-muted-foreground uppercase">{file.mimetype.split('/')[1]}</p>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Reminders (Side Panel) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">Reminders</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsReminderDialogOpen(true)}>
                <Plus size={16} />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingReminders ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <ReminderList
                  reminders={reminders || []}
                  onDelete={setDeleteId}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
    </div>
  );
}
