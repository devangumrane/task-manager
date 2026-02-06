import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Tag as TagIcon } from "lucide-react";
import { getWorkspaceTags, createTag, attachTag, detachTag } from "../../services/tagService";
import { motion, AnimatePresence } from "framer-motion";

export default function TagSelector({ workspaceId, projectId, taskId, currentTags = [] }) {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newTagColor, setNewTagColor] = useState("#3B82F6"); // Default blue

    // Fetch all available tags
    const { data: allTags } = useQuery({
        queryKey: ["tags", workspaceId],
        queryFn: () => getWorkspaceTags(workspaceId, projectId),
    });

    const createTagMutation = useMutation({
        mutationFn: (name) => createTag(workspaceId, projectId, { name, color: newTagColor }),
        onSuccess: (newTag) => {
            queryClient.invalidateQueries(["tags", workspaceId]);
            // Auto attach after create
            attachTagMutation.mutate(newTag.id);
            setIsCreating(false);
            setSearchTerm("");
        },
    });

    const attachTagMutation = useMutation({
        mutationFn: (tagId) => attachTag(workspaceId, projectId, taskId, tagId),
        onSuccess: () => {
            queryClient.invalidateQueries(["task", workspaceId, projectId, taskId]); // Refresh task to show new tag
            setIsAdding(false);
        },
    });

    const detachTagMutation = useMutation({
        mutationFn: (tagId) => detachTag(workspaceId, projectId, taskId, tagId),
        onSuccess: () => {
            queryClient.invalidateQueries(["task", workspaceId, projectId, taskId]);
        },
    });

    // Filter tags not already attached
    const availableTags = allTags?.filter(
        (t) => !currentTags.some((ct) => ct.id === t.id)
    ) || [];

    const filteredTags = availableTags.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-3">
            {/* Current Tags List */}
            <div className="flex flex-wrap gap-2">
                {currentTags.map((tag) => (
                    <span
                        key={tag.id}
                        className="px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-white/10"
                        style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color,
                            borderColor: tag.color + '40'
                        }}
                    >
                        {tag.name}
                        <button
                            onClick={() => detachTagMutation.mutate(tag.id)}
                            className="hover:bg-black/20 rounded-full p-0.5"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}

                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-xs text-muted-foreground flex items-center gap-1 transition-colors"
                >
                    <Plus size={12} /> Add Tag
                </button>
            </div>

            {/* Add Tag Dropdown */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-xl w-64 absolute z-50"
                    >
                        <input
                            type="text"
                            placeholder="Search or create tag..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary mb-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />

                        <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                            {filteredTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => attachTagMutation.mutate(tag.id)}
                                    className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 text-xs flex items-center gap-2"
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                    <span className="text-gray-300">{tag.name}</span>
                                </button>
                            ))}

                            {filteredTags.length === 0 && searchTerm && (
                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-[10px] text-muted-foreground mb-2">Create "{searchTerm}"</p>
                                    <div className="flex gap-2 mb-2">
                                        {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewTagColor(color)}
                                                className={`w-4 h-4 rounded-full ${newTagColor === color ? 'ring-2 ring-white' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => createTagMutation.mutate(searchTerm)}
                                        disabled={createTagMutation.isPending}
                                        className="w-full py-1 rounded bg-primary text-white text-xs font-medium hover:bg-primary/90"
                                    >
                                        Create Tag
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
