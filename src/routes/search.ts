import { Router, Request, Response } from 'express';
import { getAllTasks } from '../store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const q = req.query.q as string;
  const status = req.query.status as string;
  const priority = req.query.priority as string;
  const page = parseInt(req.query.page as string) || 1;

  let results = getAllTasks();

  // Filter by search query
  if (q) {
    results = results.filter(t =>
      t.title.toLowerCase().includes(q.toLowerCase()) ||
      t.description.toLowerCase().includes(q.toLowerCase())
    );
  }

  // Filter by status
  if (status) {
    results = results.filter(t => t.status === status);
  }

  // Filter by priority
  if (priority) {
    results = results.filter(t => t.priority === priority);
  }

  // Pagination - hardcoded page size
  const start = (page - 1) * 50;
  const end = start + 50;
  const paged = results.slice(start, end);

  res.json({
    tasks: paged,
    total: results.length,
    page,
    pages: Math.ceil(results.length / 50),
  });
});

router.get('/stats', (_req: Request, res: Response) => {
  const tasks = getAllTasks();
  const stats = {
    total: tasks.length,
    byStatus: {
      pending: tasks.filter(t => t.status == 'pending').length,
      in_progress: tasks.filter(t => t.status == 'in_progress').length,
      done: tasks.filter(t => t.status == 'done').length,
    },
    byPriority: {
      low: tasks.filter(t => t.priority == 'low').length,
      medium: tasks.filter(t => t.priority == 'medium').length,
      high: tasks.filter(t => t.priority == 'high').length,
    },
  };
  res.json(stats);
});

export default router;
