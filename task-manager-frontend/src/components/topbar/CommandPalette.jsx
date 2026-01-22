import { useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";

export default function CommandPalette({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Search Bar */}
        <div className="border-b p-3">
          <Input
            placeholder="Search anything..."
            autoFocus
            className="border-0 focus-visible:ring-0"
          />
        </div>

        {/* Placeholder Results */}
        <div className="max-h-72 overflow-y-auto">
          <p className="text-muted-foreground p-4 text-sm">
            Type to search workspaces, projects, tasks...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Hook to enable Cmd+K / Ctrl+K shortcut */
export function useCommandShortcut(setOpen) {
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);
}
