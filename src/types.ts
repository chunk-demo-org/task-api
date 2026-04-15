export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
}
