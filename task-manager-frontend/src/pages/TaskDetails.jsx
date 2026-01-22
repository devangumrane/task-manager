import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTaskById, getTaskAttachments } from "../services/taskService";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "../router/paths";

export default function TaskDetails() {
  const { workspaceId, projectId, taskId } = useParams();
  const navigate = useNavigate();

  const { data: task, isLoading: loadingTask } = useQuery({
    queryKey: ["task", workspaceId, projectId, taskId],
    queryFn: () => getTaskById(workspaceId, projectId, taskId),
  });

  const { data: attachments, isLoading: loadingAttachments } = useQuery({
    queryKey: ["taskAttachments", workspaceId, projectId, taskId],
    queryFn: () => getTaskAttachments(workspaceId, projectId, taskId),
  });

  if (loadingTask) return <p>Loading task…</p>;
  if (!task) return <p>Task not found.</p>;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(ROUTES.TASK(workspaceId, projectId, task.id))}
        className="flex items-center gap-2 text-gray-600 hover:text-black"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Task */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <p className="text-gray-600">{task.description}</p>

        <div className="text-sm text-gray-500 space-y-2">
          <p>
            Status: <span className="font-medium">{task.status}</span>
          </p>
          <p>
            Priority: <span className="font-medium">{task.priority}</span>
          </p>
          <p>
            Due:{" "}
            {task.due_date
              ? new Date(task.due_date).toLocaleDateString()
              : "—"}
          </p>
        </div>
      </div>

      {/* Attachments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Attachments</h2>

        {loadingAttachments ? (
          <p>Loading attachments…</p>
        ) : attachments?.length === 0 ? (
          <p>No attachments.</p>
        ) : (
          <div className="space-y-3">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="bg-white shadow p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{file.filename}</p>
                  <p className="text-xs text-gray-500">{file.mimetype}</p>
                </div>

                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
