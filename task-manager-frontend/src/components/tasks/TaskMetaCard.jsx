import { useState } from "react";
import { User, Calendar, RotateCcw } from "lucide-react";
import GlassCard from "../shared/GlassCard";
import MemberSelector from "../shared/MemberSelector";
import TagSelector from "./TagSelector";
import SkillSelector from "./SkillSelector";

export default function TaskMetaCard({
    workspaceId,
    projectId,
    taskId,
    task,
    onUpdate,
    onRecurrenceClick
}) {
    const [isEditingSkills, setIsEditingSkills] = useState(false);
    const [skillSelection, setSkillSelection] = useState([]);

    // Removed useEffect that synced skillSelection from task


    const handleSaveSkills = () => {
        onUpdate({
            taskId: Number(taskId),
            payload: { skills: skillSelection.map(s => s.id) }
        }, {
            onSuccess: () => setIsEditingSkills(false)
        });
    };

    return (
        <GlassCard>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Details</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 text-sm text-foreground w-full">
                        <div className="p-2 rounded-lg bg-accent group-hover:bg-primary/20 transition-colors">
                            <User size={16} className="text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Assignee</p>
                            <MemberSelector
                                workspaceId={workspaceId}
                                currentAssigneeId={task.assignee?.id}
                                onSelect={(user) => {
                                    onUpdate({
                                        taskId: Number(taskId),
                                        payload: { assignedTo: user ? user.id : null }
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 text-sm text-foreground">
                        <div className="p-2 rounded-lg bg-accent group-hover:bg-primary/20 transition-colors">
                            <Calendar size={16} className="text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Due Date</p>
                            <div className="flex items-center gap-2">
                                <p className="font-medium">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "-"}</p>
                                <button
                                    onClick={onRecurrenceClick}
                                    className={`p-1 rounded hover:bg-white/10 ${task.recurring ? 'text-blue-400' : 'text-muted-foreground'}`}
                                    title="Set Recurring Schedule"
                                >
                                    <RotateCcw size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="my-6 h-px bg-border" />

            {/* Tags */}
            <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Tags</p>
                <TagSelector workspaceId={workspaceId} projectId={projectId} taskId={taskId} currentTags={task.tags || []} />
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Skills</p>
                    <button onClick={() => {
                        if (!isEditingSkills) setSkillSelection(task.skills || []);
                        setIsEditingSkills(!isEditingSkills);
                    }} className="text-xs text-primary hover:underline">
                        {isEditingSkills ? 'Done' : 'Edit'}
                    </button>
                </div>
                {isEditingSkills ? (
                    <div className="space-y-2">
                        <SkillSelector value={skillSelection} onChange={setSkillSelection} />
                        <button onClick={handleSaveSkills} className="w-full py-1.5 rounded bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30">Save Skills</button>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {task.skills?.length > 0 ? (
                            task.skills.map(s => (
                                <span key={s.id} className="px-2 py-1 rounded bg-secondary border border-border text-xs text-secondary-foreground hover:border-primary/50 transition-colors cursor-default">
                                    {s.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground italic">No skills required</span>
                        )}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
