import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const priorityColors = {
  LOW: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  MEDIUM: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  HIGH: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  URGENT: "bg-red-100 text-red-700 hover:bg-red-200",
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
  };

  if(!task) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing group hover:shadow-md transition-all",
        isDragging && "opacity-50",
        isOverlay && "shadow-xl rotate-2 scale-105 opacity-100 cursor-grabbing z-50 ring-2 ring-primary/20",
        "flex flex-col gap-2 relative"
      )}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
            {task.title}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-1">
         <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-5 font-semibold", priorityColors[task.priority])}>
            {task.priority || "MEDIUM"}
         </Badge>

         {task.assigned && (
             <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarImage src={task.assigned.profileImage} />
                <AvatarFallback className="text-[9px] bg-slate-200">
                    {task.assigned.name?.substring(0,2)?.toUpperCase() || "U"}
                </AvatarFallback>
             </Avatar>
         )}
      </div>
    </div>
  );
}
