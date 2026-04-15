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
