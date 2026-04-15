import { z } from 'zod';

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { message: 'Title cannot be empty' })
      .max(200, { message: 'Title must not exceed 200 characters' }),
    description: z.string().optional(),
    priority: z
      .enum(['low', 'medium', 'high'], {
        message: "Priority must be one of 'low', 'medium', or 'high'",
      })
      .optional(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z
      .string({ message: 'Title must be a string' })
      .trim()
      .min(1, { message: 'Title cannot be empty' })
      .max(200, { message: 'Title must not exceed 200 characters' })
      .optional(),
    description: z.string().optional(),
    status: z
      .enum(['pending', 'in_progress', 'done'], {
        message: "Status must be one of 'pending', 'in_progress', or 'done'",
      })
      .optional(),
    priority: z
      .enum(['low', 'medium', 'high'], {
        message: "Priority must be one of 'low', 'medium', or 'high'",
      })
      .optional(),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
