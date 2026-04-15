import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string({ message: 'Title must be a string' })
    .min(1, { message: 'Title cannot be empty' })
    .max(200, { message: 'Title must not exceed 200 characters' })
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Title cannot be empty' }),
  description: z.string().optional(),
  priority: z
    .enum(['low', 'medium', 'high'], {
      message: "Priority must be one of 'low', 'medium', or 'high'",
    })
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string({ message: 'Title must be a string' })
    .min(1, { message: 'Title cannot be empty' })
    .max(200, { message: 'Title must not exceed 200 characters' })
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Title cannot be empty' })
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
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
