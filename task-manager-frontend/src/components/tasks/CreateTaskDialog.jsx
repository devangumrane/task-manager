import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import RichTextEditor from "../ui/RichTextEditor";

import { useCreateTask } from "../../hooks/useTasks";
import { searchUsers } from "../../services/userService";

export default function CreateTaskDialog({
  open,
  onClose,
  projectId,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Priority removed from schema? No, user never said explicitly.
  // But Task model in schema had: status, position, dueDate.
  // It did NOT have priority.
  // Wait, let's check schema.prisma again.
  // Task model: id, projectId, assigneeId, title, description, status, position, dueDate, createdAt, updatedAt.
  // NO PRIORITY.
  // I should remove priority from this dialog.

  // assignee state
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assigneeResults, setAssigneeResults] = useState([]);
  const [assignedUser, setAssignedUser] = useState(null);

  const createTask = useCreateTask(projectId);

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
        ...(assignedUser?.id ? { assigneeId: assignedUser.id } : {}), // Schema uses assigneeId
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Assignee</label>

              {assignedUser ? (
                <div className="flex items-center justify-between border rounded px-3 py-2 text-sm bg-gray-50">
                  <span className="font-medium">{assignedUser.name || assignedUser.email}</span>
                  <button
                    type="button"
                    onClick={() => setAssignedUser(null)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Search user..."
                    value={assigneeQuery}
                    onChange={(e) => handleAssigneeSearch(e.target.value)}
                  />
                  {assigneeResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-auto">
                      {assigneeResults.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setAssignedUser(u);
                            setAssigneeResults([]);
                            setAssigneeQuery("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                        >
                          {u.name || u.email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
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
