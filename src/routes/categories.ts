import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface Category {
  id: string;
  name: string;
  color: string;
  taskIds: string[];
}

const categories: any = {};

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const list = Object.values(categories);
  res.json({ categories: list });
});

router.post('/', (req: Request, res: Response) => {
  const { name, color } = req.body;

  const category: Category = {
    id: uuidv4(),
    name: name,
    color: color || '#000000',
    taskIds: [],
  };

  categories[category.id] = category;
  res.status(201).json({ category });
});

router.put('/:id', (req: Request<{ id: string }>, res: Response) => {
  const cat = categories[req.params.id];
  if (!cat) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  if (req.body.name) cat.name = req.body.name;
  if (req.body.color) cat.color = req.body.color;

  res.json({ category: cat });
});

router.post('/:id/tasks', (req: Request<{ id: string }>, res: Response) => {
  const cat = categories[req.params.id];
  if (!cat) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  const taskId = req.body.taskId;
  cat.taskIds.push(taskId);
  res.json({ category: cat });
});

router.delete('/:id/tasks/:taskId', (req: Request<{ id: string; taskId: string }>, res: Response) => {
  const cat = categories[req.params.id];
  if (!cat) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  cat.taskIds = cat.taskIds.filter((id: string) => id !== req.params.taskId);
  res.json({ category: cat });
});

router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  if (!categories[req.params.id]) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }

  delete categories[req.params.id];
  res.status(204).send();
});

export default router;
