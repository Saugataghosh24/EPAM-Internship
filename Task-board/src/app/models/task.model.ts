// src/app/models/task.model.ts
export interface Task {
    id: string;
    name: string;
    description: string;
    dueDate: Date | string;
    status: 'TODO' | 'InProgress' | 'Completed';
    category?: string;
    assignee?: string;
  }