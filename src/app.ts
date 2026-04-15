import express from 'express';
import taskRoutes from './routes/tasks';
import webhookRoutes from './routes/webhooks';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/tasks', taskRoutes);
app.use('/webhooks', webhookRoutes);

export default app;
