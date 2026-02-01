import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTaskById, getTaskAttachments } from "../services/taskService";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../router/paths";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export default function TaskDetails() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  // 1. Fetch Task
  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ["task", projectId, taskId],
    queryFn: () => getTaskById(projectId, taskId),
    enabled: !!projectId && !!taskId,
  });

  // 2. Fetch Attachments (Optional, if we kept them)
  const { data: attachments, isLoading: loadingAttachments } = useQuery({
    queryKey: ["taskAttachments", projectId, taskId],
    queryFn: () => getTaskAttachments(projectId, taskId),
  });

  if (loadingTask) return <p className="p-8">Loading task…</p>;
  if (!task) return <p className="p-8">Task not found.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate(ROUTES.PROJECT(projectId))}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Project
      </button>

      {/* Main Content */}
      <div className="max-w-3xl space-y-6">
        <Card className="shadow-none border bg-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{task.title}</h1>
                <div className="flex gap-2 mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span className="px-2 py-1 bg-secondary rounded">{task.status}</span>
                  {/* Priority might not exist in new schema? Checking... Task model has status, position. No priority. */}
                  {/* <span className="px-2 py-1 bg-secondary rounded">{task.priority}</span> */}
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
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                </span>
                {/* Fixed property name: backend uses camelCase 'dueDate' in Prisma, but check response */}
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
                    </div>
                    {/* Add download link if available */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
