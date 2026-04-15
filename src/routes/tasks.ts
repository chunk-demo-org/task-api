import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskInput, UpdateTaskInput } from '../types';
import { getAllTasks, getTaskById, saveTask, deleteTask } from '../store';

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
  const input: CreateTaskInput = req.body;

  if (!input.title || input.title.trim().length === 0) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const now = new Date().toISOString();
  const task = {
    id: uuidv4(),
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    status: 'pending' as const,
    priority: input.priority ?? 'medium',
    createdAt: now,
    updatedAt: now,
  };

  saveTask(task);
  res.status(201).json({ task });
});

router.put('/:id', (req: Request<{ id: string }>, res: Response) => {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const input: UpdateTaskInput = req.body;
  const updated = {
    ...existing,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    updatedAt: new Date().toISOString(),
  };

  saveTask(updated);
  res.json({ task: updated });
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
