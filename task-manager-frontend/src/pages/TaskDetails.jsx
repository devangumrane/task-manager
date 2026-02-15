import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, getTaskAttachments } from "../services/taskService";
import { getReminders, createReminder, deleteReminder } from "../services/reminderService";
import { ArrowLeft, Plus, Trash, Edit2, MessageSquare, CheckSquare, FileText, Clock } from "lucide-react";
import { useDeleteTask, useUpdateTask } from "../hooks/useTasks";
import { useTaskRealtime } from "../hooks/useTaskRealtime";
import { useComments } from "../hooks/useComments";
import { ROUTES } from "../router/paths";
import Editor from "../components/shared/Editor";
import CommentList from "../components/comments/CommentList";
import CommentForm from "../components/comments/CommentForm";
import Checklist from "../components/tasks/Checklist";
import ReminderList from "../components/reminders/ReminderList";
import CreateReminderDialog from "../components/reminders/CreateReminderDialog";
import ConfirmDialog from "../components/shared/ConfirmDialog";
import TaskHeader from "../components/tasks/TaskHeader";
import TaskMetaCard from "../components/tasks/TaskMetaCard";
import TaskAttachmentsWidget from "../components/tasks/TaskAttachmentsWidget";
import DependencyList from "../components/tasks/DependencyList";
import TimeTracker from "../components/tasks/TimeTracker";
import RecurrenceDialog from "../components/reminders/RecurrenceDialog";
import GlassCard from "../components/shared/GlassCard";
import { getStatusColor, getPriorityColor } from "../config/theme.constants";

export default function TaskDetails() {
  const { workspaceId, projectId, taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useTaskRealtime(workspaceId, projectId, Number(taskId));

  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isRecurrenceDialogOpen, setIsRecurrenceDialogOpen] = useState(false);
  const [deleteReminderId, setDeleteReminderId] = useState(null);
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);

  const deleteTaskMutation = useDeleteTask(workspaceId, projectId);
  const updateTaskMutation = useUpdateTask(workspaceId, projectId);

  const { comments, isLoading: loadingComments, createComment, deleteComment } = useComments(workspaceId, projectId, taskId);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState("");
  /* Removed unused state */

  // Fetch Data
  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ["task", workspaceId, projectId, taskId],
    queryFn: () => getTaskById(workspaceId, projectId, taskId),
  });

  const { data: attachments, isLoading: loadingAttachments } = useQuery({
    queryKey: ["taskAttachments", workspaceId, projectId, taskId],
    queryFn: () => getTaskAttachments(workspaceId, projectId, taskId),
  });

  const { data: reminders, isLoading: loadingReminders } = useQuery({
    queryKey: ["taskReminders", workspaceId, projectId, taskId],
    queryFn: () => getReminders(workspaceId, projectId, taskId),
  });

  const handleEditDescription = () => {
    setDescriptionContent(task.description || "");
    setIsEditingDescription(true);
  };

  /* Removed useEffect syncing description */

  const handleSaveDescription = () => {
    updateTaskMutation.mutate({ taskId: Number(taskId), payload: { description: descriptionContent } }, {
      onSuccess: () => setIsEditingDescription(false)
    });
  };

  /* Removed handleSaveSkills */

  const handleDeleteTask = () => {
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => navigate(ROUTES.PROJECT(workspaceId, projectId)),
    });
  };
  // ...
  // ... in render:
  {
    !isEditingDescription && (
      <button onClick={handleEditDescription} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
        <Edit2 size={12} /> Edit
      </button>
    )
  }

  const createReminderMutation = useMutation({
    mutationFn: (data) => createReminder(workspaceId, projectId, taskId, data),
    onSuccess: () => queryClient.invalidateQueries(["taskReminders", workspaceId, projectId, taskId]),
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id) => deleteReminder(workspaceId, projectId, taskId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(["taskReminders", workspaceId, projectId, taskId]);
      setDeleteReminderId(null);
    },
  });

  if (loadingTask) return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!task) return <div className="p-8 text-center text-muted-foreground">Task not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header / Nav */}
      {/* Header / Nav */}
      <TaskHeader workspaceId={workspaceId} projectId={projectId} task={task} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Task Card */}
          <GlassCard className="relative overflow-hidden group">
            {/* Status Stripe */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${getStatusColor(task.status).stripe}`} />

            <div className="flex justify-between items-start mb-6 pl-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status).badgeBg} ${getStatusColor(task.status).text}`}>
                    {task.status === 'pending' ? 'To Do' : task.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-white/10 ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteTaskConfirm(true)}
                className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Task"
              >
                <Trash size={18} />
              </button>
            </div>

            {/* Description */}
            <div className="pl-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <FileText size={14} /> Description
                </span>
                {!isEditingDescription && (
                  <button onClick={() => setIsEditingDescription(true)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                    <Edit2 size={12} /> Edit
                  </button>
                )}
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5 min-h-[100px]">
                {isEditingDescription ? (
                  <div className="space-y-4">
                    <Editor value={descriptionContent} onChange={setDescriptionContent} />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsEditingDescription(false)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-white/5 text-muted-foreground">Cancel</button>
                      <button onClick={handleSaveDescription} className="px-3 py-1.5 rounded-lg text-sm bg-primary text-white hover:bg-primary/90">Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: task.description || "<p class='text-muted-foreground italic'>No description provided.</p>" }}
                  />
                )}
              </div>
            </div>
          </GlassCard>

          {/* Subtasks */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-4 text-white font-semibold">
              <CheckSquare size={18} className="text-primary" />
              Subtasks
            </div>
            <Checklist workspaceId={workspaceId} projectId={projectId} taskId={taskId} />
          </GlassCard>

          {/* Comments */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-6 text-white font-semibold">
              <MessageSquare size={18} className="text-primary" />
              Discussion
            </div>
            <div className="space-y-6">
              <CommentForm
                onSubmit={(content) => createComment.mutate(content)}
                disabled={createComment.isPending}
              />
              <div className="divide-y divide-white/5">
                {loadingComments ? (
                  <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
                ) : (
                  <CommentList comments={comments || []} onDelete={(id) => deleteComment.mutate(id)} />
                )}
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Meta & Sidebar */}
        <div className="space-y-6">

          {/* Time Tracker */}
          <TimeTracker workspaceId={workspaceId} projectId={projectId} taskId={taskId} timeEntries={task.timeEntries || []} />

          {/* Meta Card */}
          <TaskMetaCard
            workspaceId={workspaceId}
            projectId={projectId}
            taskId={taskId}
            task={task}
            onUpdate={updateTaskMutation.mutate}
            onRecurrenceClick={() => setIsRecurrenceDialogOpen(true)}
          />

          {/* Dependencies */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Dependencies</h3>
            <DependencyList workspaceId={workspaceId} projectId={projectId} task={task} />
          </GlassCard>

          {/* Reminders */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} /> Reminders
              </h3>
              <button onClick={() => setIsReminderDialogOpen(true)} className="p-1 hover:bg-white/10 rounded">
                <Plus size={16} className="text-primary" />
              </button>
            </div>
            {loadingReminders ? (
              <div className="text-xs text-center text-muted-foreground">Loading...</div>
            ) : (
              <ReminderList reminders={reminders || []} onDelete={setDeleteReminderId} />
            )}
          </GlassCard>

          {/* Attachments Sidebar Widget */}
          <TaskAttachmentsWidget
            workspaceId={workspaceId}
            projectId={projectId}
            taskId={taskId}
            attachments={attachments}
            isLoading={loadingAttachments}
          />

        </div>
      </div>

      {/* Dialogs */}
      <RecurrenceDialog
        open={isRecurrenceDialogOpen}
        onOpenChange={setIsRecurrenceDialogOpen}
        workspaceId={workspaceId}
        projectId={projectId}
        task={task}
      />
      <CreateReminderDialog
        open={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        onSubmit={(data) => createReminderMutation.mutateAsync(data)}
      />
      <ConfirmDialog
        open={!!deleteReminderId}
        onOpenChange={(open) => !open && setDeleteReminderId(null)}
        title="Delete Reminder?"
        description="This will remove the notification."
        destructive
        onConfirm={() => deleteReminderMutation.mutate(deleteReminderId)}
      />
      <ConfirmDialog
        open={showDeleteTaskConfirm}
        onOpenChange={setShowDeleteTaskConfirm}
        title="Delete Task?"
        description="Are you sure you want to delete this task? This cannot be undone."
        destructive
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
