import { useState, useEffect } from "react";
import { useCreateTask } from "../../hooks/useTasks";
import { X, Loader2, Check, AlignLeft } from "lucide-react";
import MemberSelector from "../shared/MemberSelector";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Editor from "../shared/Editor";
import SkillSelector from "./SkillSelector";

export default function CreateTaskDialog({ open, onClose, workspaceId, projectId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");


  const [assignedUser, setAssignedUser] = useState(null);

  const [skills, setSkills] = useState([]);

  const createTask = useCreateTask(workspaceId, projectId);

  useEffect(() => {
    if (open) {

      // Reset form
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle("");
      setDescription("");
      setPriority("medium");
      setSkills([]);
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate(
      {
        title,
        description,
        priority, // Added payload
        skills: skills.map(s => s.id),
        ...(assignedUser?.id ? { assignedTo: assignedUser.id } : {}),
      },
      {
        onSuccess: () => {
          onClose();
          // Optional: Add toast success
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
            <div className="bg-[#151A23] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto flex flex-col max-h-[90vh]">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">Create New Task</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Task Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlignLeft size={16} /> Description
                  </label>
                  <div className="min-h-[150px] border border-white/10 rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors">
                    <Editor content={description} onChange={setDescription} placeholder="Add more details..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-muted-foreground">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary appearance-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                    <MemberSelector
                      workspaceId={workspaceId}
                      currentAssigneeId={assignedUser?.id}
                      onSelect={setAssignedUser}
                      placeholder="Select assignee..."
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Required Skills</label>
                  <SkillSelector value={skills} onChange={setSkills} />
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createTask.isPending || !title.trim()}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createTask.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Create Task
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
