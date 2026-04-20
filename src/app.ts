import express from 'express';
import taskRoutes from './routes/tasks';
import searchRoutes from './routes/search';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/tasks', taskRoutes);
app.use('/search', searchRoutes);

export default app;
