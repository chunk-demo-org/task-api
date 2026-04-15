import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import { getAllTasks } from '../store';

const router = Router();

router.get('/csv', (_req: Request, res: Response) => {
  const tasks = getAllTasks();

  let csv = 'id,title,description,status,priority,createdAt,updatedAt\n';

  for (const task of tasks) {
    csv += `${task.id},${task.title},${task.description},${task.status},${task.priority},${task.createdAt},${task.updatedAt}\n`;
  }

  // Write to temp file
  const filePath = '/tmp/tasks-export.csv';
  fs.writeFileSync(filePath, csv);

  res.download(filePath);
});

router.get('/json', (_req: Request, res: Response) => {
  const tasks = getAllTasks();

  const data = JSON.stringify(tasks, null, 2);
  const filePath = '/tmp/tasks-export.json';
  fs.writeFileSync(filePath, data);

  res.download(filePath);
});

router.post('/import', (req: Request, res: Response) => {
  const { data, format } = req.body;

  if (format === 'csv') {
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const imported = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const values = lines[i].split(',');
      const record: any = {};
      headers.forEach((h: string, idx: number) => {
        record[h.trim()] = values[idx];
      });
      imported.push(record);
    }

    res.json({ imported: imported.length, records: imported });
  } else {
    const parsed = JSON.parse(data);
    res.json({ imported: parsed.length, records: parsed });
  }
});

export default router;
