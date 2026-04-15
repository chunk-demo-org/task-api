import express from 'express';
import taskRoutes from './routes/tasks';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);
app.use('/tags', tagRoutes);

export default app;
