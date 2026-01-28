import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.number().optional(),
  parentId: z.number().optional(),
  order: z.number().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  address: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assignedTo: z.number().optional().nullable(),
  parentId: z.number().optional().nullable(),
  order: z.number().optional(),
}).strict();
