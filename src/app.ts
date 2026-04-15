import express from 'express';
import taskRoutes from './routes/tasks';
import exportRoutes from './routes/export';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/tasks', taskRoutes);
app.use('/export', exportRoutes);

export default app;
