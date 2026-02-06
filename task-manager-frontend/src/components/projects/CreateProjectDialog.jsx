import { useState } from "react";
import { useCreateProject } from "../../hooks/useProjects";
import { Dialog, DialogContent, DialogTitle } from "@mui/material"; // Removing this
import { X, Loader2, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateProjectDialog({ open, onClose, workspaceId }) {
  const [name, setName] = useState("");
  const createProject = useCreateProject(workspaceId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject.mutate(
      { name, workspaceId },
      {
        onSuccess: () => {
          setName("");
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#151A23] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto">

              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Folder size={18} className="text-primary" /> New Project
                </h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Website Overhaul"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProject.isPending || !name.trim()}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-lg shadow-primary/25 transition-all disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    {createProject.isPending ? <Loader2 size={16} className="animate-spin" /> : "Create Project"}
                  </button>
                </div>
              </form>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
