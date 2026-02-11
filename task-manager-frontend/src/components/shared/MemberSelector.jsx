import { useState, useEffect, useRef } from "react";
import { User, Loader2, X, Check } from "lucide-react";
import { useWorkspace } from "../../hooks/useWorkspaces";

export default function MemberSelector({ workspaceId, currentAssigneeId, onSelect, placeholder = "Assign to..." }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState([]);
    const containerRef = useRef(null);

    const { data: workspace, isLoading } = useWorkspace(workspaceId);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (q) => {
        setQuery(q);
        if (!isOpen) setIsOpen(true);

        if (workspace?.members) {
            const users = workspace.members.map(m => m.user);
            if (!q.trim()) {
                setResults(users);
                return;
            }

            const lowerQ = q.toLowerCase();
            const matches = users.filter(u =>
                u.name.toLowerCase().includes(lowerQ) ||
                u.email.toLowerCase().includes(lowerQ)
            );
            setResults(matches);
        }
    };

    const handleSelect = (user) => {
        onSelect(user);
        setIsOpen(false);
        setQuery("");
    };

    const currentMember = workspace?.members?.find(m => m.user.id === currentAssigneeId)?.user;

    return (
        <div className="relative" ref={containerRef}>
            {currentMember && !isOpen ? (
                <div
                    onClick={() => {
                        setResults(workspace?.members?.map(m => m.user) || []);
                        setIsOpen(true);
                    }}
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 cursor-pointer transition-colors group"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {currentMember.name?.[0] || "U"}
                        </div>
                        <span className="text-sm text-white font-medium">{currentMember.name}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(null);
                        }}
                        className="p-1 rounded-full hover:bg-white/20 text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => {
                            setResults(workspace?.members?.map(m => m.user) || []);
                            setIsOpen(true);
                        }}
                        placeholder={placeholder}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 focus:border-primary/50 outline-none transition-colors"
                    />

                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A202C] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50">
                            {isLoading ? (
                                <div className="p-4 flex justify-center">
                                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                                </div>
                            ) : results.length > 0 ? (
                                results.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSelect(user)}
                                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 text-left transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-muted-foreground">
                                                {user.name?.[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-white">{user.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                        {currentAssigneeId === user.id && <Check size={14} className="text-primary" />}
                                    </button>
                                ))
                            ) : (
                                <div className="p-3 text-xs text-muted-foreground text-center">
                                    No members found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
