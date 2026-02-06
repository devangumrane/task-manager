import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { User } from "lucide-react";

const priorityColors = {
  LOW: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function KanbanCard({ task, isOverlay, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isOverlay ? 999 : 'auto',
  };

  if (!task) return null;

  const prioClass = priorityColors[task.priority] || priorityColors.MEDIUM;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border bg-[#151A23]
        cursor-grab active:cursor-grabbing group
        transition-all duration-200
        ${isOverlay
          ? 'shadow-[0_0_30px_rgba(124,58,237,0.3)] border-primary/50 scale-105'
          : 'border-white/5 shadow-lg hover:border-white/10 hover:bg-white/5'
        }
      `}
    >
      {/* Priority Indicator Line */}
      <div className={`absolute top-3 left-0 w-0.5 h-6 rounded-r-full ${task.priority === 'URGENT' ? 'bg-red-500' :
          task.priority === 'HIGH' ? 'bg-orange-500' :
            task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-gray-500'
        }`} />

      <h4 className="font-semibold text-sm text-gray-200 mb-3 truncate pl-2">{task.title}</h4>

      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${prioClass} uppercase tracking-wider`}>
          {task.priority || "MEDIUM"}
        </span>

        {task.assigned ? (
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
            {task.assigned.name?.substring(0, 2)?.toUpperCase() || "U"}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground border border-white/5">
            <User size={12} />
          </div>
        )}
      </div>
    </div>
  );
}
