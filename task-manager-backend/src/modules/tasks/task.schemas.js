import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.number().optional(),
  parentId: z.number().optional(),
  order: z.number().optional(),
  skills: z.array(z.number()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  address: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assignedTo: z.number().optional().nullable(),
  parentId: z.number().optional().nullable(),
  order: z.number().optional(),
  skills: z.array(z.number()).optional(),
}).strict();
