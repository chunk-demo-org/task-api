import { Router, Request, Response } from 'express';

// Tags stored as simple label -> task ID mapping
const tagMap: Record<string, string[]> = {};

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const tags = Object.keys(tagMap).map(label => ({
    label,
    count: tagMap[label].length,
  }));
  res.json({ tags });
});

router.post('/assign', (req: Request, res: Response) => {
  const { tag, taskId } = req.body;

  if (!tagMap[tag]) {
    tagMap[tag] = [];
  }

  if (!tagMap[tag].includes(taskId)) {
    tagMap[tag].push(taskId);
  }

  res.json({ tag, taskIds: tagMap[tag] });
});

router.delete('/remove', (req: Request, res: Response) => {
  const { tag, taskId } = req.body;

  if (tagMap[tag]) {
    tagMap[tag] = tagMap[tag].filter(id => id !== taskId);
    if (tagMap[tag].length === 0) {
      delete tagMap[tag];
    }
  }

  res.json({ success: true });
});

router.get('/by-task/:taskId', (req: Request<{ taskId: string }>, res: Response) => {
  const taskTags = Object.entries(tagMap)
    .filter(([_, ids]) => ids.includes(req.params.taskId))
    .map(([label]) => label);

  res.json({ tags: taskTags });
});

export default router;
