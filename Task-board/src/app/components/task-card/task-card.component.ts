// task-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  template: `
    <div class="jira-card" [ngClass]="{'editing': isEditing}">
      <div *ngIf="!isEditing" class="card-content">
        <div class="card-header">
          <div class="card-type" [ngClass]="getTaskTypeClass(task)">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="card-actions">
            <button class="card-action-btn" (click)="toggleEdit()">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="card-action-btn" (click)="onDelete()">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        
        <h3 class="card-title">{{ task.name }}</h3>
        <p class="card-description">{{ task.description }}</p>
        
        <div class="card-footer">
          <div class="due-date" [ngClass]="{'overdue': isOverdue(task.dueDate)}">
            <i class="far fa-calendar"></i> {{ task.dueDate | date:'MMM d' }}
          </div>
          
          <div *ngIf="task.category" class="category">
            <span class="category-badge" [style.backgroundColor]="getCategoryColor(task.category)">
              {{ task.category }}
            </span>
          </div>
          
          <div *ngIf="task.assignee" class="assignee">
            <span class="assignee-avatar">
              {{ getInitials(task.assignee) }}
            </span>
          </div>
        </div>
      </div>
      
      <div *ngIf="isEditing" class="edit-form">
        <h4>Edit Task</h4>
        
        <div class="form-group">
          <label>Title</label>
          <input class="form-control" [(ngModel)]="editedTask.name" placeholder="Task title">
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea class="form-control" [(ngModel)]="editedTask.description" placeholder="Description"></textarea>
        </div>
        
        <div class="form-group">
          <label>Due Date</label>
          <input class="form-control" type="date" [ngModel]="formatDateForInput(editedTask.dueDate)" 
                 (ngModelChange)="updateDueDate($event)">
        </div>
        
        <div class="form-group">
          <label>Category</label>
          <input class="form-control" [(ngModel)]="editedTask.category" placeholder="Category">
        </div>
        
        <div class="form-group">
          <label>Assignee</label>
          <input class="form-control" [(ngModel)]="editedTask.assignee" placeholder="Assignee">
        </div>
        
        <div class="form-actions">
          <button class="btn btn-primary" (click)="saveChanges()">Save</button>
          <button class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jira-card {
      background-color: white;
      border-radius: 3px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      margin-bottom: 8px;
      cursor: pointer;
      transition: background-color 0.2s, box-shadow 0.2s;
    }
    
    .jira-card:hover {
      background-color: #fafbfc;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }
    
    .card-content {
      padding: 12px;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .card-type {
      font-size: 12px;
      color: #6554c0;
    }
    
    .card-type.bug {
      color: #e53935;
    }
    
    .card-type.feature {
      color: #43a047;
    }
    
    .card-type.task {
      color: #1e88e5;
    }
    
    .card-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .jira-card:hover .card-actions {
      opacity: 1;
    }
    
    .card-action-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b778c;
      font-size: 12px;
      padding: 2px;
    }
    
    .card-action-btn:hover {
      color: #172b4d;
    }
    
    .card-title {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      color: #172b4d;
    }
    
    .card-description {
      font-size: 13px;
      color: #5e6c84;
      margin: 0 0 12px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
    
    .due-date {
      color: #5e6c84;
    }
    
    .due-date.overdue {
      color: #e53935;
    }
    
    .category-badge {
      display: inline-block;
      padding: 2px 4px;
      border-radius: 3px;
      color: white;
      font-size: 11px;
    }
    
    .assignee-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #0052cc;
      color: white;
      font-size: 11px;
      font-weight: bold;
    }
    
    .edit-form {
      padding: 12px;
    }
    
    .edit-form h4 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .form-group {
      margin-bottom: 12px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      font-weight: 500;
      color: #5e6c84;
    }
    
    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #dfe1e6;
      border-radius: 3px;
      font-size: 14px;
    }
    
    textarea.form-control {
      min-height: 80px;
      resize: vertical;
    }
    
    .form-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    
    .btn {
      padding: 8px 12px;
      border-radius: 3px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    
    .btn-primary {
      background-color: #0052cc;
      color: white;
    }
    
    .btn-secondary {
      background-color: rgba(9, 30, 66, 0.04);
      color: #172b4d;
    }
  `]
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();
  
  isEditing = false;
  editedTask: Task = {} as Task;
  
  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.editedTask = {...this.task};
  }
  
  saveChanges() {
    this.editTask.emit(this.editedTask);
    this.isEditing = false;
  }
  
  cancelEdit() {
    this.isEditing = false;
  }
  
  onDelete() {
    this.deleteTask.emit(this.task.id);
  }
  
  getTaskTypeClass(task: Task): string {
    if (task.category?.toLowerCase().includes('bug')) return 'bug';
    if (task.category?.toLowerCase().includes('feature')) return 'feature';
    return 'task';
  }
  
  // Updated to handle both string and Date types
  isOverdue(date: string | Date): boolean {
    if (!date) return false;
    
    try {
      const dueDate = typeof date === 'string' ? new Date(date) : date;
      const today = new Date();
      
      // Check if the date is valid before comparing
      if (isNaN(dueDate.getTime())) return false;
      
      return dueDate < today;
    } catch (error) {
      console.error('Error checking if date is overdue:', error);
      return false;
    }
  }
  
  // Helper method to format date for input element
  formatDateForInput(date: string | Date): string {
    if (!date) return '';
    
    try {
      const dueDate = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid
      if (isNaN(dueDate.getTime())) return '';
      
      // Format as YYYY-MM-DD for input[type="date"]
      return dueDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  }
  
  // Update due date from input
  updateDueDate(dateString: string) {
    this.editedTask.dueDate = new Date(dateString);
  }
  
  getCategoryColor(category: string): string {
    // Simple hash function to generate consistent colors for categories
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}