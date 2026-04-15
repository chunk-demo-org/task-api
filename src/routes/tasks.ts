import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllTasks, getTaskById, saveTask, deleteTask } from '../store';
import { createTaskSchema, updateTaskSchema } from '../validation';
import { ZodError } from 'zod';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const tasks = getAllTasks();
  res.json({ tasks });
});

router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  const task = getTaskById(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json({ task });
});

router.post('/', (req: Request, res: Response) => {
  try {
    // Check for missing or non-string title first
    if (req.body.title === undefined || req.body.title === null) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    if (typeof req.body.title !== 'string') {
      res.status(400).json({ error: 'Title must be a string' });
      return;
    }

    const input = createTaskSchema.parse(req.body);

    const now = new Date().toISOString();
    const task = {
      id: uuidv4(),
      title: input.title,
      description: input.description?.trim() ?? '',
      status: 'pending' as const,
      priority: input.priority ?? 'medium',
      createdAt: now,
      updatedAt: now,
    };

    saveTask(task);
    res.status(201).json({ task });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      res.status(400).json({ error: firstError.message });
      return;
    }
    throw error;
  }
});

router.put('/:id', (req: Request<{ id: string }>, res: Response) => {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  try {
    const input = updateTaskSchema.parse(req.body);
    const updated = {
      ...existing,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      updatedAt: new Date().toISOString(),
    };

    saveTask(updated);
    res.json({ task: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      res.status(400).json({ error: firstError.message });
      return;
    }
    throw error;
  }
});

router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  const existed = deleteTask(req.params.id);
  if (!existed) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(204).send();
});

export default router;
