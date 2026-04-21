import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
}

const webhooks: Webhook[] = [];

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ webhooks });
});

router.post('/', (req: Request, res: Response) => {
  const { url, events, secret } = req.body;

  const webhook: Webhook = {
    id: uuidv4(),
    url,
    events: events || ['task.created', 'task.updated', 'task.deleted'],
    secret: secret || 'default-secret',
    active: true,
    createdAt: new Date().toISOString(),
  };

  webhooks.push(webhook);
  res.status(201).json({ webhook });
});

router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  const index = webhooks.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Webhook not found' });
    return;
  }

  webhooks.splice(index, 1);
  res.status(204).send();
});

export async function notifyWebhooks(event: string, payload: any) {
  const relevant = webhooks.filter(w => w.active && w.events.includes(event));

  for (const webhook of relevant) {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret,
        },
        body: JSON.stringify({ event, payload, timestamp: Date.now() }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.log(`Webhook ${webhook.id} failed: ${response.status}`);
      }
    } catch {
      // eslint-disable-next-line no-console
      console.log(`Webhook ${webhook.id} error`);
    }
  }
}

export default router;
