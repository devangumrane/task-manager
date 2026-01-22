import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

import { useCreateTask } from "../../hooks/useTasks";
import { searchUsers } from "../../services/userService";

export default function CreateTaskDialog({
  open,
  onClose,
  workspaceId,
  projectId,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // assignee state
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assigneeResults, setAssigneeResults] = useState([]);
  const [assignedUser, setAssignedUser] = useState(null);

  const createTask = useCreateTask(workspaceId, projectId);

  // ----------------------------------
  // Search users (simple, controlled)
  // ----------------------------------
  const handleAssigneeSearch = async (q) => {
    setAssigneeQuery(q);

    if (!q.trim()) {
      setAssigneeResults([]);
      return;
    }

    try {
      const users = await searchUsers(q);
      setAssigneeResults(users);
    } catch {
      setAssigneeResults([]);
    }
  };

  // ----------------------------------
  // Submit
  // ----------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate(
      {
        title,
        description,
        ...(assignedUser?.id ? { assignedTo: assignedUser.id } : {}),
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setAssigneeQuery("");
          setAssigneeResults([]);
          setAssignedUser(null);
          onClose();
        },
        onError: (err) => {
          console.error("CREATE TASK ERROR", err);
          alert(err?.response?.data?.error?.message || "Failed to create task");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description */}
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Assignee */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Assignee (optional)</label>

            {assignedUser ? (
              <div className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                <span>{assignedUser.name || assignedUser.email}</span>
                <button
                  type="button"
                  onClick={() => setAssignedUser(null)}
                  className="text-red-500 text-xs"
                >
                  Remove
                </button>
                {/* console.log("ASSIGNED USER", assignedUser); */}
                {/* console.log("ASSIGNED TO PAYLOAD", assignedUser?.id, typeof
                assignedUser?.id); */}
              </div>
            ) : (
              <Input
                placeholder="Search user by name or email"
                value={assigneeQuery}
                onChange={(e) => handleAssigneeSearch(e.target.value)}
              />
            )}

            {assigneeResults.length > 0 && !assignedUser && (
              <div className="border rounded max-h-40 overflow-auto">
                {assigneeResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setAssignedUser(u);
                      setAssigneeResults([]);
                      setAssigneeQuery("");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                  >
                    {u.name || u.email}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
