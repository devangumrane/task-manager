import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

const statuses = ["todo", "in_progress", "done"];

export default function KanbanBoard({ tasks = [], onTaskUpdate, onTaskClick }) {
  const [activeTask, setActiveTask] = useState(null);

  // Derive columns from tasks prop (assumes tasks are already sorted by order by parent/API)
  const columns = useMemo(() => {
    const cols = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => {
      if (cols[t.status]) cols[t.status].push(t);
    });
    return cols;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // 1. Identify Target Status
    let newStatus = activeTask.status;
    let overTask = tasks.find((t) => t.id === overId);

    if (overTask) {
      newStatus = overTask.status;
    } else if (statuses.includes(overId)) {
      newStatus = overId;
    }

    // 2. Calculate New Order (if needed)
    // We need the list of tasks in the target column
    const targetColumnTasks = columns[newStatus];

    // If we are just moving to an empty column
    if (statuses.includes(overId) && targetColumnTasks.length === 0) {
      if (activeTask.status !== newStatus) {
        onTaskUpdate(activeId, { status: newStatus, order: Date.now() }); // Append
      }
      return;
    }

    // If we dropped over a card
    if (overTask) {
      // Find index of overTask
      const overIndex = targetColumnTasks.findIndex(t => t.id === overId);
      const activeIndex = targetColumnTasks.findIndex(t => t.id === activeId); // might be -1 if different column

      // Calculate generic new positions
      // Simplification: We take the average of neighbors.
      // But we don't know if we dropped 'above' or 'below' easily without measuring client rects 
      // OR dnd-kit's collision.
      // A robust trick is to use the index in the list.

      // Wait, since we are using SortableContext in Column, dnd-kit handles sorting VISUALLY?
      // No, we are managing state. 
      // Let's assume we dropped "at the position of overTask".

      let newOrder = overTask.order;

      // Refined logic: 
      // We need to know if we are inserting BEFORE or AFTER overTask.
      // We can do a simpler heuristic:
      // Try to place it between overTask and its predecessor/successor.

      // For now, let's just trigger updates.
      // To do this PERFECTLY requires `onDragOver` strategies or `sortable` state.
      // Let's implement a standard "Sortable" reorder using indices.

      // We simulate the arrayMove to find neighbors.
      let newTasksInColumn = [...targetColumnTasks];
      if (activeTask.status === newStatus) {
        // Reordering in same column
        const oldIndex = targetColumnTasks.findIndex(t => t.id === activeId);
        const newIndex = targetColumnTasks.findIndex(t => t.id === overId);
        newTasksInColumn = arrayMove(newTasksInColumn, oldIndex, newIndex);

        // Now calculate order based on new neighbors
        const prev = newTasksInColumn[newIndex - 1];
        const next = newTasksInColumn[newIndex + 1];

        const prevOrder = prev ? prev.order : (next ? next.order - 1000 : 0);
        const nextOrder = next ? next.order : (prev ? prev.order + 1000 : Date.now());

        newOrder = (prevOrder + nextOrder) / 2;
      } else {
        // Moving to different column, inserted at overIndex
        // We just take average of overTask and its prev
        // Or just adopt overTask order - 1?
        newOrder = overTask.order - 500; // heuristic
      }

      onTaskUpdate(activeId, { status: newStatus, order: newOrder });
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
            tasks={columns[status]} // Pre-sorted by parent
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
