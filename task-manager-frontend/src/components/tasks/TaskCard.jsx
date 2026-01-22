import { Link } from "react-router-dom";

export default function TaskCard({ task, onStatusChange }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-3 border">
      {/* Title */}
      <h3 className="font-medium text-sm">{task.title}</h3>

      {/* Creator */}
      {task.creator && (
        <div className="text-xs text-gray-600">
          Created by{" "}
          <Link
            to={`/users/${task.creator.id}`}
            className="text-blue-600 hover:underline"
          >
            {task.creator.name || task.creator.email}
          </Link>
        </div>
      )}

      {/* Assignee */}
      <div className="text-xs text-gray-600">
        Assigned to{" "}
        {task.assigned ? (
          <Link
            to={`/users/${task.assigned.id}`}
            className="text-blue-600 hover:underline"
          >
            {task.assigned.name || task.assigned.email}
          </Link>
        ) : (
          <span className="italic text-gray-400">Unassigned</span>
        )}
      </div>

      {/* Status */}
      <div className="text-xs text-gray-500">
        Status: <span className="font-medium">{task.status}</span>
      </div>

      {/* Status actions */}
      <div className="flex gap-2 text-xs pt-1">
        {task.status !== "todo" && (
          <button
            onClick={() => onStatusChange(task.id, "todo")}
            className="px-2 py-1 border rounded hover:bg-gray-50"
          >
            ← Todo
          </button>
        )}

        {task.status !== "in_progress" && (
          <button
            onClick={() => onStatusChange(task.id, "in_progress")}
            className="px-2 py-1 border rounded hover:bg-gray-50"
          >
            In Progress
          </button>
        )}

        {task.status !== "done" && (
          <button
            onClick={() => onStatusChange(task.id, "done")}
            className="px-2 py-1 border rounded hover:bg-gray-50"
          >
            Done →
          </button>
        )}
      </div>
    </div>
  );
}
