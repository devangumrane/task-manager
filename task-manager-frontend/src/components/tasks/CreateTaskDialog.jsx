import { useState, useEffect, useRef } from "react";
import { useCreateTask } from "../../hooks/useTasks";
import { searchUsers } from "../../services/userService";
import { X, Loader2, User, Check, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "../shared/Editor";
import SkillSelector from "./SkillSelector";

export default function CreateTaskDialog({ open, onClose, workspaceId, projectId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [assigneeResults, setAssigneeResults] = useState([]);
  const [assignedUser, setAssignedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [skills, setSkills] = useState([]);

  const createTask = useCreateTask(workspaceId, projectId);
  const assignDropdownRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setAssigneeQuery("");
      setAssigneeResults([]);
      setAssignedUser(null);
      setSkills([]);
    }
  }, [open]);

  // Handle outside click for assignee dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(event.target)) {
        setAssigneeResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssigneeSearch = async (q) => {
    setAssigneeQuery(q);
    if (!q.trim()) {
      setAssigneeResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const users = await searchUsers(q);
      setAssigneeResults(users);
    } catch {
      setAssigneeResults([]);
    } finally {
      setIsSearching(false);
    }
  };

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
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-2 relative" ref={assignDropdownRef}>
                    <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                    {assignedUser ? (
                      <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                            {assignedUser.name?.[0] || "U"}
                          </div>
                          <span className="text-sm text-white font-medium">{assignedUser.name}</span>
                        </div>
                        <button onClick={() => setAssignedUser(null)} className="text-muted-foreground hover:text-white">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          value={assigneeQuery}
                          onChange={(e) => handleAssigneeSearch(e.target.value)}
                          placeholder="Search member..."
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                        />
                        {isSearching && <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-muted-foreground" />}

                        {assigneeResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A202C] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto z-10">
                            {assigneeResults.map(user => (
                              <button
                                key={user.id}
                                onClick={() => {
                                  setAssignedUser(user);
                                  setAssigneeResults([]);
                                  setAssigneeQuery("");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-left transition-colors"
                              >
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-muted-foreground">
                                  <User size={12} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-white">{user.name}</span>
                                  <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
