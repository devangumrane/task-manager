import { Paperclip, FileText } from "lucide-react";
import GlassCard from "../shared/GlassCard";
import AttachmentUploader from "../attachments/AttachmentUploader";

export default function TaskAttachmentsWidget({ workspaceId, projectId, taskId, attachments, isLoading }) {
    return (
        <GlassCard>
            <div className="flex items-center gap-2 mb-4 text-white font-semibold">
                <Paperclip size={16} className="text-primary" />
                Attachments
            </div>

            <div className="mb-4">
                <AttachmentUploader workspaceId={workspaceId} projectId={projectId} taskId={taskId} minimalist />
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {attachments?.map((file) => (
                    <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 rounded-lg bg-black/20 hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-white/5">
                                <FileText size={14} className="text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-medium text-white truncate">{file.filename}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{file.mimetype.split('/')[1]}</p>
                            </div>
                        </div>
                    </a>
                ))}
                {!isLoading && attachments?.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground py-2">No files attached</p>
                )}
            </div>
        </GlassCard>
    );
}
