// task.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$: Observable<Task[]> = this.tasksSubject.asObservable();
  
  constructor() {
    // Load tasks from localStorage if available
    this.loadTasks();
  }
  
  // Simple UUID generator
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, 
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Load tasks from localStorage
  private loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const tasks = JSON.parse(savedTasks);
        // Convert string dates back to Date objects
        const processedTasks = tasks.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null
        }));
        this.tasksSubject.next(processedTasks);
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
      }
    }
  }
  
  // Save tasks to localStorage
  private saveTasks(tasks: Task[]) {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }
  
  addTasks(tasks: Task[]) {
    console.log('Adding tasks:', tasks);
    
    if (!tasks || tasks.length === 0) {
      console.warn('No tasks to add');
      return;
    }
    
    const currentTasks = this.tasksSubject.getValue();
    const newTasks = tasks.map(task => {
      // Convert string dates to Date objects if needed
      let dueDate: Date;
      if (typeof task.dueDate === 'string') {
        dueDate = new Date(task.dueDate);
        
        // Check if the date is valid
        if (isNaN(dueDate.getTime())) {
          console.warn(`Invalid date format: ${task.dueDate}, using current date instead`);
          dueDate = new Date();
        }
      } else {
        dueDate = task.dueDate || new Date();
      }
      
      return {
        ...task,
        id: this.generateUUID(),
        status: 'TODO' as const,
        dueDate: dueDate
      };
    });
    
    const updatedTasks = [...currentTasks, ...newTasks];
    this.tasksSubject.next(updatedTasks);
    this.saveTasks(updatedTasks);
    
    console.log('Tasks added successfully. Total tasks:', updatedTasks.length);
  }
  
  updateTask(updatedTask: Task) {
    const currentTasks = this.tasksSubject.getValue();
    const updatedTasks = currentTasks.map(task => {
      if (task.id === updatedTask.id) {
        // Handle date conversion if needed
        let dueDate = updatedTask.dueDate;
        if (typeof dueDate === 'string') {
          dueDate = new Date(dueDate);
        }
        
        return {
          ...updatedTask,
          dueDate
        };
      }
      return task;
    });
    
    this.tasksSubject.next(updatedTasks);
    this.saveTasks(updatedTasks);
  }
  
  deleteTask(taskId: string) {
    const currentTasks = this.tasksSubject.getValue();
    const updatedTasks = currentTasks.filter(task => task.id !== taskId);
    
    this.tasksSubject.next(updatedTasks);
    this.saveTasks(updatedTasks);
  }
  
  // Add a method to get sample tasks for testing
  addSampleTasks() {
    const sampleTasks: Partial<Task>[] = [
      {
        name: 'Set up project repository',
        description: 'Create GitHub repository and invite team members',
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        category: 'Setup',
        assignee: 'John'
      },
      {
        name: 'Design database schema',
        description: 'Create ERD and define relationships between entities',
        dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
        category: 'Design',
        assignee: 'Sarah'
      },
      {
        name: 'Implement user authentication',
        description: 'Set up JWT authentication and user roles',
        dueDate: new Date(Date.now() + 259200000), // 3 days from now
        category: 'Development',
        assignee: 'Mike'
      }
    ];
    
    this.addTasks(sampleTasks as Task[]);
  }
  
  // Clear all tasks (useful for testing)
  clearAllTasks() {
    this.tasksSubject.next([]);
    localStorage.removeItem('tasks');
  }
}