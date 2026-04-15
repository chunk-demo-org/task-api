import { Task } from './types';

const tasks: Map<string, Task> = new Map();

export function getAllTasks(): Task[] {
  return Array.from(tasks.values());
}

export function getTaskById(id: string): Task | undefined {
  return tasks.get(id);
}

export function saveTask(task: Task): Task {
  tasks.set(task.id, task);
  return task;
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id);
}

export function clearTasks(): void {
  tasks.clear();
}
