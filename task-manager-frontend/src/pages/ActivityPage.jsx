import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getWorkspaceActivity } from "../services/activityService";

export default function ActivityPage() {
  const { workspaceId } = useParams();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activity", workspaceId],
    queryFn: () => getWorkspaceActivity(workspaceId),
    enabled: !!workspaceId,
  });

  if (isLoading) return <p>Loading activity…</p>;

  if (activities.length === 0) {
    return <p className="text-sm text-gray-500">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Activity Log</h1>

      <ul className="space-y-3">
        {activities.map((a) => (
          <li
            key={a.id}
            className="p-3 bg-white border rounded text-sm flex gap-2"
          >
            {/* User */}
            {a.user ? (
              <Link
                to={`/users/${a.user.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {a.user.name || a.user.email}
              </Link>
            ) : (
              <span className="text-gray-400">Someone</span>
            )}

            {/* Action */}
            <span className="text-gray-700">
              {humanizeActivity(a)}
            </span>

            {/* Time */}
            <span className="ml-auto text-xs text-gray-400">
              {new Date(a.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function humanizeActivity(activity) {
  switch (activity.type) {
    case "task.created":
      return "created a task";
    case "task.updated":
      return "updated a task";
    case "task.deleted":
      return "deleted a task";
    case "user.profile_updated":
      return "updated their profile";
    default:
      return activity.type;
  }
}
