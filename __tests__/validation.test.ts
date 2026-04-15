import request from 'supertest';
import app from '../src/app';
import { clearTasks } from '../src/store';

beforeEach(() => {
  clearTasks();
});

describe('POST /tasks - Validation', () => {
  describe('Valid inputs', () => {
    it('creates task with all valid fields', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({
          title: 'Valid task',
          description: 'Valid description',
          priority: 'high',
        });

      expect(res.status).toBe(201);
      expect(res.body.task).toMatchObject({
        title: 'Valid task',
        description: 'Valid description',
        priority: 'high',
        status: 'pending',
      });
    });

    it('creates task with only title', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Minimal task' });

      expect(res.status).toBe(201);
      expect(res.body.task).toMatchObject({
        title: 'Minimal task',
        status: 'pending',
        priority: 'medium',
      });
    });

    it('creates task with title at max length (200 chars)', async () => {
      const longTitle = 'a'.repeat(200);
      const res = await request(app)
        .post('/tasks')
        .send({ title: longTitle });

      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe(longTitle);
    });

    it('creates task with priority low', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Low priority task', priority: 'low' });

      expect(res.status).toBe(201);
      expect(res.body.task.priority).toBe('low');
    });

    it('creates task with priority medium', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Medium priority task', priority: 'medium' });

      expect(res.status).toBe(201);
      expect(res.body.task.priority).toBe('medium');
    });

    it('trims whitespace from title', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: '  Trimmed title  ' });

      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe('Trimmed title');
    });
  });

  describe('Invalid inputs', () => {
    it('returns 400 when title is missing', async () => {
      const res = await request(app).post('/tasks').send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('returns 400 when title is null', async () => {
      const res = await request(app).post('/tasks').send({ title: null });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('returns 400 when title is not a string', async () => {
      const res = await request(app).post('/tasks').send({ title: 123 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title must be a string');
    });

    it('returns 400 when title is empty string', async () => {
      const res = await request(app).post('/tasks').send({ title: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title cannot be empty');
    });

    it('returns 400 when title is only whitespace', async () => {
      const res = await request(app).post('/tasks').send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title cannot be empty');
    });

    it('returns 400 when title exceeds 200 characters', async () => {
      const longTitle = 'a'.repeat(201);
      const res = await request(app).post('/tasks').send({ title: longTitle });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title must not exceed 200 characters');
    });

    it('returns 400 when priority is invalid', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Task', priority: 'urgent' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Priority must be one of 'low', 'medium', or 'high'"
      );
    });

    it('returns 400 when priority is empty string', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Task', priority: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Priority must be one of 'low', 'medium', or 'high'"
      );
    });

    it('returns 400 when priority is a number', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Task', priority: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Priority must be one of 'low', 'medium', or 'high'"
      );
    });
  });
});

describe('PUT /tasks/:id - Validation', () => {
  let taskId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Original task', priority: 'medium' });
    taskId = res.body.task.id;
  });

  describe('Valid inputs', () => {
    it('updates task with valid title', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: 'Updated title' });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe('Updated title');
    });

    it('updates task with valid status', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('in_progress');
    });

    it('updates task with status done', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ status: 'done' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('done');
    });

    it('updates task with status pending', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ status: 'pending' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('pending');
    });

    it('updates task with valid priority', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ priority: 'high' });

      expect(res.status).toBe(200);
      expect(res.body.task.priority).toBe('high');
    });

    it('updates task with multiple valid fields', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({
          title: 'Complete update',
          status: 'done',
          priority: 'low',
        });

      expect(res.status).toBe(200);
      expect(res.body.task).toMatchObject({
        title: 'Complete update',
        status: 'done',
        priority: 'low',
      });
    });

    it('updates task with title at max length (200 chars)', async () => {
      const longTitle = 'b'.repeat(200);
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: longTitle });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe(longTitle);
    });

    it('trims whitespace from title on update', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: '  Trimmed update  ' });

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe('Trimmed update');
    });

    it('allows empty body (no updates)', async () => {
      const res = await request(app).put(`/tasks/${taskId}`).send({});

      expect(res.status).toBe(200);
      expect(res.body.task.title).toBe('Original task');
    });
  });

  describe('Invalid inputs', () => {
    it('returns 400 when title is empty string', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title cannot be empty');
    });

    it('returns 400 when title is only whitespace', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title cannot be empty');
    });

    it('returns 400 when title is not a string', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: 456 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title must be a string');
    });

    it('returns 400 when title exceeds 200 characters', async () => {
      const longTitle = 'b'.repeat(201);
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: longTitle });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title must not exceed 200 characters');
    });

    it('returns 400 when status is invalid', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Status must be one of 'pending', 'in_progress', or 'done'"
      );
    });

    it('returns 400 when status is empty string', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ status: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Status must be one of 'pending', 'in_progress', or 'done'"
      );
    });

    it('returns 400 when status is a number', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ status: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Status must be one of 'pending', 'in_progress', or 'done'"
      );
    });

    it('returns 400 when priority is invalid', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ priority: 'critical' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Priority must be one of 'low', 'medium', or 'high'"
      );
    });

    it('returns 400 when priority is empty string', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ priority: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Priority must be one of 'low', 'medium', or 'high'"
      );
    });

    it('returns 400 when priority is a number', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .send({ priority: 2 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Priority must be one of 'low', 'medium', or 'high'"
      );
    });
  });
});
