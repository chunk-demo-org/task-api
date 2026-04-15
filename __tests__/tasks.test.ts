import request from 'supertest';
import app from '../src/app';
import { clearTasks } from '../src/store';

beforeEach(() => {
  clearTasks();
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('POST /tasks', () => {
  it('creates a task with valid input', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Write tests', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.task).toMatchObject({
      title: 'Write tests',
      priority: 'high',
      status: 'pending',
    });
    expect(res.body.task.id).toBeDefined();
  });

  it('creates a task with minimum valid input', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Minimal task' });

    expect(res.status).toBe(201);
    expect(res.body.task).toMatchObject({
      title: 'Minimal task',
      priority: 'medium',
      status: 'pending',
    });
  });

  it('creates a task with all valid priorities', async () => {
    const priorities = ['low', 'medium', 'high'] as const;
    for (const priority of priorities) {
      const res = await request(app)
        .post('/tasks')
        .send({ title: `Task with ${priority} priority`, priority });

      expect(res.status).toBe(201);
      expect(res.body.task.priority).toBe(priority);
    }
  });

  it('trims whitespace from title', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: '  Trimmed title  ' });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe('Trimmed title');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('returns 400 when title is empty', async () => {
    const res = await request(app).post('/tasks').send({ title: '  ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title cannot be empty');
  });

  it('returns 400 when title is not a string', async () => {
    const res = await request(app).post('/tasks').send({ title: 123 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title must be a string');
  });

  it('returns 400 when title exceeds 200 characters', async () => {
    const longTitle = 'a'.repeat(201);
    const res = await request(app).post('/tasks').send({ title: longTitle });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title must not exceed 200 characters');
  });

  it('accepts title with exactly 200 characters', async () => {
    const maxTitle = 'a'.repeat(200);
    const res = await request(app).post('/tasks').send({ title: maxTitle });
    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe(maxTitle);
  });

  it('returns 400 when priority is invalid', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Task', priority: 'urgent' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Priority must be one of 'low', 'medium', or 'high'");
  });
});

describe('GET /tasks', () => {
  it('returns empty list when no tasks exist', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([]);
  });

  it('returns all tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });

    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
  });
});

describe('GET /tasks/:id', () => {
  it('returns a task by id', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Find me' });

    const res = await request(app).get(`/tasks/${created.body.task.id}`);
    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Find me');
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app).get('/tasks/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PUT /tasks/:id', () => {
  it('updates a task', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Original' });

    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ title: 'Updated', status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Updated');
    expect(res.body.task.status).toBe('done');
  });

  it('updates only status without changing title', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Original' });

    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Original');
    expect(res.body.task.status).toBe('in_progress');
  });

  it('updates all valid status values', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Status test' });

    const statuses = ['pending', 'in_progress', 'done'] as const;
    for (const status of statuses) {
      const res = await request(app)
        .put(`/tasks/${created.body.task.id}`)
        .send({ status });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe(status);
    }
  });

  it('updates priority', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Priority test', priority: 'low' });

    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ priority: 'high' });

    expect(res.status).toBe(200);
    expect(res.body.task.priority).toBe('high');
  });

  it('trims whitespace from updated title', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Original' });

    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ title: '  Trimmed  ' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Trimmed');
  });

  it('returns 400 when title is empty', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Original' });

    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title cannot be empty');
  });

  it('returns 400 when title is not a string', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Original' });

    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ title: 123 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title must be a string');
  });

  it('returns 400 when title exceeds 200 characters', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Original' });

    const longTitle = 'a'.repeat(201);
    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ title: longTitle });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title must not exceed 200 characters');
  });

  it('accepts title with exactly 200 characters', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Original' });

    const maxTitle = 'a'.repeat(200);
    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ title: maxTitle });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe(maxTitle);
  });

  it('returns 400 when status is invalid', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Task' });

    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Status must be one of 'pending', 'in_progress', or 'done'");
  });

  it('returns 400 when priority is invalid', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Task' });

    const res = await request(app)
      .put(`/tasks/${created.body.task.id}`)
      .send({ priority: 'urgent' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Priority must be one of 'low', 'medium', or 'high'");
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/tasks/nonexistent')
      .send({ title: 'Nope' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  it('deletes a task', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Delete me' });

    const res = await request(app).delete(`/tasks/${created.body.task.id}`);
    expect(res.status).toBe(204);

    const check = await request(app).get(`/tasks/${created.body.task.id}`);
    expect(check.status).toBe(404);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app).delete('/tasks/nonexistent');
    expect(res.status).toBe(404);
  });
});
