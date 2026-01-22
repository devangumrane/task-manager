import { useState } from "react";
import { useCreateProject } from "../../hooks/useProjects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function CreateProjectDialog({ open, onClose, workspaceId }) {
  const [name, setName] = useState("");
  const createProject = useCreateProject(workspaceId);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject.mutate({ name }, {
      onSuccess: () => {
        setName("");
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit}>
          <Input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4"
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
