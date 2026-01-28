import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

const titleMap = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function KanbanColumn({ status, tasks, onTaskClick }) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-gray-700">{titleMap[status]}</h3>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 bg-gray-50/50 rounded-xl p-2 space-y-3 min-h-[500px] border-2 border-transparent transition-colors hover:border-gray-100"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
             {tasks.map((task) => (
                <KanbanCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
             ))}
        </SortableContext>
        
        {tasks.length === 0 && (
            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm italic">
                No tasks
            </div>
        )}
      </div>
    </div>
  );
}
