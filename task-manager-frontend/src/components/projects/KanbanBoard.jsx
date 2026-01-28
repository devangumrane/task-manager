import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

const statuses = ["todo", "in_progress", "done"];

export default function KanbanBoard({ tasks = [], onTaskUpdate, onTaskClick }) {
  // We can convert the tasks array into a structured object { todo: [], ... }
  // but for dnd-kit simple implementation, distinct lists are often easier to manage
  // locally for optimistic updates.

  // However, simpler for now: Just filter in the columns.
  // Actually, for dnd-kit to work well with ordering, we probably want local state.

  // Let's stick to mapped columns for now and handle status change on drop.

  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag (prevents accidental clicks)
      },
    })
  );

  const onDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => t.id === taskId);
    
    // Check if dropped on a column (status change)
    // We assume the droppable ID of the column is the status name
    // OR if dropped on another card, we check that card's column.

    let newStatus = over.id;

    // If dropped over a card, find that card's status
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
        newStatus = overTask.status;
    }

    // Guard against invalid status
    if (!statuses.includes(newStatus)) return;

    // Only update if status changed
    if (task.status !== newStatus) {
        onTaskUpdate(taskId, { status: newStatus });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeTask && <KanbanCard task={activeTask} isOverlay />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
