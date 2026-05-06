import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    assignee: z.string().optional(),
    dueDate: z.string().datetime().optional()
  })
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    assignee: z.string().nullable().optional(),
    dueDate: z.string().datetime().nullable().optional()
  }),
  params: z.object({
    taskId: z.string().min(1)
  })
});
