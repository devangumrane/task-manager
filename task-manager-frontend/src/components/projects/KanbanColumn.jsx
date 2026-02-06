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
    <div className="flex flex-col w-[320px] flex-shrink-0 h-full">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="font-bold text-muted-foreground text-sm uppercase tracking-wider">
          {titleMap[status]}
        </h3>
        <span className="bg-white/5 text-xs font-mono py-0.5 px-2 rounded-md text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="
            flex-1 p-2 rounded-xl bg-white/[0.02] border border-white/5
            flex flex-col gap-3 min-h-[200px]
            transition-colors
        "
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg">
            <span className="text-xs text-muted-foreground/50 italic">
              Drop items here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
