import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-board',
  template: `
    <div class="jira-board">
      <div class="board-column" data-column-type="todo">
        <div class="column-header">
          <h2>TO DO</h2>
          <span class="task-count">{{ todoTasks.length }}</span>
        </div>
        <div class="tasks-container"
             cdkDropList
             #todoList="cdkDropList"
             [cdkDropListData]="todoTasks"
             [cdkDropListConnectedTo]="[inProgressList]"
             (cdkDropListDropped)="drop($event)">
          <div class="empty-state" *ngIf="todoTasks.length === 0">
            <p>No tasks yet. Use the AI chat to create tasks.</p>
          </div>
          <app-task-card *ngFor="let task of todoTasks" 
                        [task]="task"
                        cdkDrag
                        (editTask)="onEditTask($event)"
                        (deleteTask)="onDeleteTask($event)">
            <div class="drag-placeholder" *cdkDragPlaceholder></div>
          </app-task-card>
        </div>
      </div>
      
      <div class="board-column" data-column-type="in-progress">
        <div class="column-header">
          <h2>IN PROGRESS</h2>
          <span class="task-count">{{ inProgressTasks.length }}</span>
        </div>
        <div class="tasks-container"
             cdkDropList
             #inProgressList="cdkDropList"
             [cdkDropListData]="inProgressTasks"
             [cdkDropListConnectedTo]="[todoList, completedList]"
             (cdkDropListDropped)="drop($event)">
          <div class="empty-state" *ngIf="inProgressTasks.length === 0">
            <p>No tasks in progress</p>
          </div>
          <app-task-card *ngFor="let task of inProgressTasks" 
                        [task]="task"
                        cdkDrag
                        (editTask)="onEditTask($event)"
                        (deleteTask)="onDeleteTask($event)">
            <div class="drag-placeholder" *cdkDragPlaceholder></div>
          </app-task-card>
        </div>
      </div>
      
      <div class="board-column" data-column-type="completed">
        <div class="column-header">
          <h2>DONE</h2>
          <span class="task-count">{{ completedTasks.length }}</span>
        </div>
        <div class="tasks-container"
             cdkDropList
             #completedList="cdkDropList"
             [cdkDropListData]="completedTasks"
             [cdkDropListConnectedTo]="[inProgressList]"
             (cdkDropListDropped)="drop($event)">
          <div class="empty-state" *ngIf="completedTasks.length === 0">
            <p>No completed tasks</p>
          </div>
          <app-task-card *ngFor="let task of completedTasks" 
                        [task]="task"
                        cdkDrag
                        (editTask)="onEditTask($event)"
                        (deleteTask)="onDeleteTask($event)">
            <div class="drag-placeholder" *cdkDragPlaceholder></div>
          </app-task-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jira-board {
      display: flex;
      gap: 20px;
      height: 100%;
      min-height: 400px;
    }
    
    .board-column {
      background-color: #f4f5f7;
      border-radius: 3px;
      width: 33.33%;
      display: flex;
      flex-direction: column;
      max-height: 100%;
    }
    
    .column-header {
      padding: 12px 16px;
      background-color: #f4f5f7;
      border-bottom: 2px solid #dfe1e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .column-header h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #5e6c84;
    }
    
    .task-count {
      background-color: rgba(9, 30, 66, 0.04);
      color: #5e6c84;
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 12px;
    }
    
    .tasks-container {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      min-height: 100px;
    }
    
    .empty-state {
      color: #5e6c84;
      text-align: center;
      padding: 20px 0;
      font-size: 13px;
    }
    
    .drag-placeholder {
      background: #ccc;
      border: dotted 3px #999;
      min-height: 60px;
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .cdk-drag-preview {
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .tasks-container.cdk-drop-list-dragging app-task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class TaskBoardComponent implements OnInit {
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  completedTasks: Task[] = [];
  
  constructor(private taskService: TaskService) {}
  
  ngOnInit() {
    this.taskService.tasks$.subscribe((tasks: Task[]) => {
      this.todoTasks = tasks.filter(task => task.status === 'TODO');
      this.inProgressTasks = tasks.filter(task => task.status === 'InProgress');
      this.completedTasks = tasks.filter(task => task.status === 'Completed');
    });
  }
  
  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // If the item is dropped in the same container, just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // If the item is moved to another container
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      // Update task status based on new container
      const task = event.container.data[event.currentIndex];
      
      // Find the column type from the closest parent with data-column-type attribute
      const containerElement = event.container.element.nativeElement;
      let columnType = '';
      
      // Find the parent element with data-column-type
      let parent = containerElement.parentElement;
      while (parent) {
        if (parent.hasAttribute('data-column-type')) {
          // Fix: Handle potential null return from getAttribute
          const attributeValue = parent.getAttribute('data-column-type');
          columnType = attributeValue !== null ? attributeValue : '';
          break;
        }
        parent = parent.parentElement;
      }
      
      // Set status based on column type
      switch (columnType) {
        case 'todo':
          task.status = 'TODO';
          break;
        case 'in-progress':
          task.status = 'InProgress';
          break;
        case 'completed':
          task.status = 'Completed';
          break;
        default:
          // Fallback to checking text content if data attribute approach fails
          this.updateTaskStatusByText(task, containerElement);
      }
      
      // Update the task in the service
      this.taskService.updateTask(task);
    }
  }
  
  // Fallback method to determine status based on text content
  private updateTaskStatusByText(task: Task, element: HTMLElement): void {
    // Try to find the column header text
    let parent = element.parentElement;
    let headerText = '';
    
    while (parent && !headerText) {
      const headerElement = parent.querySelector('.column-header h2');
      if (headerElement) {
        headerText = headerElement?.textContent || '';
        break;
      }
      parent = parent.parentElement;
    }
    
    // Set status based on header text
    if (headerText.includes('TO DO')) {
      task.status = 'TODO';
    } else if (headerText.includes('IN PROGRESS')) {
      task.status = 'InProgress';
    } else if (headerText.includes('DONE')) {
      task.status = 'Completed';
    } else {
      console.warn('Could not determine task status from column');
    }
  }
  
  onEditTask(task: Task) {
    this.taskService.updateTask(task);
  }
  
  onDeleteTask(taskId: string) {
    this.taskService.deleteTask(taskId);
  }
}