import express from 'express';
import taskRoutes from './routes/tasks';
import authRoutes from './routes/auth';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

export default app;
