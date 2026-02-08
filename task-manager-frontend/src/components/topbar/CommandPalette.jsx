import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchGlobal } from "../../services/searchService";
import { ROUTES } from "../../router/paths";
import { Search, Command, X, ArrowRight, Layout, Folder, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Inline debounce hook if not exists
function useDebounceValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, 300);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Shortcut listener
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Check valid query length to avoid unnecessary calls
  const shouldFetch = debouncedQuery.length >= 2;

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchGlobal(debouncedQuery),
    enabled: shouldFetch,
    staleTime: 60000,
  });

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery(""); // Reset on close
    }
  }, [isOpen]);

  const handleSelect = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const hasResults = results && (results.tasks.length > 0 || results.projects.length > 0 || results.workspaces.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-2xl bg-[#0F1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-muted-foreground/50"
            placeholder="Search tasks, projects, workspaces..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">ESC</span>
            </kbd>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* content */}
        <div className="overflow-y-auto p-2">
          {!shouldFetch && query.length > 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Type at least 2 characters to search...
            </div>
          )}

          {isLoading && (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Searching...
            </div>
          )}

          {shouldFetch && !isLoading && !hasResults && (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Search size={32} className="mb-3 opacity-20" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {shouldFetch && !isLoading && hasResults && (
            <div className="space-y-4">
              {/* Workspaces */}
              {results.workspaces.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1 mt-2">Workspaces</h3>
                  {results.workspaces.map(ws => (
                    <button
                      key={`ws-${ws.id}`}
                      onClick={() => handleSelect(ROUTES.WORKSPACE(ws.id))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-primary transition-colors text-left group"
                    >
                      <Layout size={16} className="text-muted-foreground group-hover:text-primary" />
                      <span className="text-sm font-medium text-white group-hover:text-primary">{ws.name}</span>
                      <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1 mt-2">Projects</h3>
                  {results.projects.map(p => (
                    <button
                      key={`p-${p.id}`}
                      onClick={() => handleSelect(ROUTES.PROJECT(p.workspace_id, p.id))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-primary transition-colors text-left group"
                    >
                      <Folder size={16} className="text-muted-foreground group-hover:text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white group-hover:text-primary">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground">{p.workspace?.name}</span>
                      </div>
                      <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1 mt-2">Tasks</h3>
                  {results.tasks.map(t => (
                    <button
                      key={`t-${t.id}`}
                      onClick={() => handleSelect(ROUTES.TASK(t.project.workspace_id, t.project.id, t.id))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-primary transition-colors text-left group"
                    >
                      <CheckSquare size={16} className={`text-muted-foreground group-hover:text-primary ${t.status === 'done' ? 'text-emerald-500' : ''}`} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white group-hover:text-primary truncate">{t.title}</span>
                        <span className="text-[10px] text-muted-foreground flex gap-1">
                          <span>{t.project?.workspace?.name}</span> / <span>{t.project?.name}</span>
                        </span>
                      </div>
                      <ArrowRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 bg-black/20 text-[10px] text-muted-foreground flex justify-between">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">↑↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">Enter</kbd> to select</span>
          </div>
          <span>Advanced Search</span>
        </div>
      </motion.div>
    </div>
  );
}
