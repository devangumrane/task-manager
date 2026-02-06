import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, getTaskAttachments } from "../services/taskService";
import { getReminders, createReminder, deleteReminder } from "../services/reminderService";
import { ArrowLeft, Plus, Trash, Save, X, Edit2, MessageSquare, Calendar, User, Clock, Paperclip, CheckSquare } from "lucide-react";
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
import AttachmentUploader from "../components/attachments/AttachmentUploader";
import SkillSelector from "../components/tasks/SkillSelector";
import GlassCard from "../components/shared/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

export default function TaskDetails() {
  const { workspaceId, projectId, taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useTaskRealtime(workspaceId, projectId, Number(taskId));

  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [deleteReminderId, setDeleteReminderId] = useState(null);
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);

  const deleteTaskMutation = useDeleteTask(workspaceId, projectId);
  const updateTaskMutation = useUpdateTask(workspaceId, projectId);

  const { comments, isLoading: loadingComments, createComment, deleteComment } = useComments(workspaceId, projectId, taskId);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillSelection, setSkillSelection] = useState([]);

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

  useEffect(() => {
    if (task) {
      setDescriptionContent(task.description || "");
      setSkillSelection(task.skills || []);
    }
  }, [task]);

  const handleSaveDescription = () => {
    updateTaskMutation.mutate({ taskId: Number(taskId), payload: { description: descriptionContent } }, {
      onSuccess: () => setIsEditingDescription(false)
    });
  };

  const handleSaveSkills = () => {
    updateTaskMutation.mutate({ taskId: Number(taskId), payload: { skills: skillSelection.map(s => s.id) } }, {
      onSuccess: () => setIsEditingSkills(false)
    });
  };

  const handleDeleteTask = () => {
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => navigate(ROUTES.PROJECT(workspaceId, projectId)),
    });
  };

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
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.TASK(workspaceId, projectId, task.id).replace('tasks/' + task.id, ''))}
          className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-muted-foreground">/</span>
        <button className="text-muted-foreground hover:text-white transition-colors">Projects</button>
        <span className="text-muted-foreground">/</span>
        <span className="text-white font-medium truncate max-w-md">{task.title}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Main Task Card */}
          <GlassCard className="relative overflow-hidden group">
            {/* Status Stripe */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${task.status === 'COMPLETED' ? 'bg-emerald-500' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-orange-500'
              }`} />

            <div className="flex justify-between items-start mb-6 pl-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-white/10 ${task.priority === 'HIGH' ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
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

          {/* Meta Card */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-sm text-white">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                    <User size={16} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assignee</p>
                    <p className="font-medium">{task.assignee?.name || <span className="italic text-muted-foreground">Unassigned</span>}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-sm text-white">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-colors">
                    <Calendar size={16} className="text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="font-medium">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="my-6 h-px bg-white/10" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Skills</p>
                <button onClick={() => setIsEditingSkills(!isEditingSkills)} className="text-xs text-primary hover:underline">
                  {isEditingSkills ? 'Done' : 'Edit'}
                </button>
              </div>
              {isEditingSkills ? (
                <div className="space-y-2">
                  <SkillSelector value={skillSelection} onChange={setSkillSelection} />
                  <button onClick={handleSaveSkills} className="w-full py-1.5 rounded bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30">Save Skills</button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {task.skills?.length > 0 ? (
                    task.skills.map(s => (
                      <span key={s.id} className="px-2 py-1 rounded bg-secondary/50 border border-white/5 text-xs text-secondary-foreground hover:border-primary/50 transition-colors cursor-default">
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No skills required</span>
                  )}
                </div>
              )}
            </div>
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
          <GlassCard>
            <div className="flex items-center gap-2 mb-4 text-white font-semibold">
              <Paperclip size={16} className="text-primary" />
              Attachments
            </div>

            <div className="mb-4">
              <AttachmentUploader workspaceId={workspaceId} projectId={projectId} taskId={taskId} minimalist />
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              {attachments?.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg bg-black/20 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-white/5">
                      <FileText size={14} className="text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-white truncate">{file.filename}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{file.mimetype.split('/')[1]}</p>
                    </div>
                  </div>
                </a>
              ))}
              {!loadingAttachments && attachments?.length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-2">No files attached</p>
              )}
            </div>
          </GlassCard>

        </div>
      </div>

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
