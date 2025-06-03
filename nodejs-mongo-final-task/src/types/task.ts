export interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  user: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}