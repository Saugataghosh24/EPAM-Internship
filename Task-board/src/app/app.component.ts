// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="jira-app">
      <header class="jira-header">
        <div class="logo">
          <span class="logo-text">Task Board</span>
        </div>
        <div class="header-actions">
          <span class="user-info">
            <i class="fas fa-user-circle"></i>
          </span>
        </div>
      </header>
      
      <div class="jira-content">
        <nav class="jira-sidebar">
          <div class="sidebar-item active">
            <i class="fas fa-tasks"></i>
            <span>Board</span>
          </div>
          <div class="sidebar-item">
            <i class="fas fa-chart-line"></i>
            <span>Reports</span>
          </div>
          <div class="sidebar-item">
            <i class="fas fa-cog"></i>
            <span>Settings</span>
          </div>
        </nav>
        
        <main class="jira-main">
          <div class="board-header">
            <h1>Task Board</h1>
            <div class="board-controls">
              <button class="btn btn-secondary">
                <i class="fas fa-filter"></i> Filter
              </button>
            </div>
          </div>
          
          <div class="board-container">
            <app-task-board></app-task-board>
          </div>
          
          <div class="chat-panel">
            <h2><i class="fas fa-robot"></i> AI Task Generator</h2>
            <app-ai-chat></app-ai-chat>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .jira-app {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f4f5f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Helvetica Neue', sans-serif;
    }
    
    .jira-header {
      background-color:rgb(4, 20, 12);
      color: white;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
    
    .logo-text {
      font-size: 20px;
      font-weight: bold;
    }
    
    .jira-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .jira-sidebar {
      width: 0px;
      background-color: #0747a6;
      color: white;
      padding-top: 20px;

      transition: width 0.3s;
    }
    
    
    
    .sidebar-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      cursor: pointer;
    }
    
    .sidebar-item i {
      margin-right: 15px;
      font-size: 18px;
    }
    
    .sidebar-item.active {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .jira-main {
      flex: 1;
      padding: 20px;
      display: flex;
      overflow: hidden;
    }
    
    .board-header {

      display: none;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .board-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    
    .btn {
      padding: 8px 16px;
      border-radius: 3px;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    
    .btn-secondary {
      background-color: rgba(9, 30, 66, 0.04);
      color: #172b4d;
    }
    
    .board-container {
      flex: 1;
      overflow: auto;
      margin-bottom: 20px;
    }
    
    .chat-panel {
      background-color: white;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      padding: 15px;
      height: 500px;
      width:400px;
    }
    
    .chat-panel h2 {
      margin-top: 0;
      font-size: 16px;
      color: #172b4d;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    
    .chat-panel h2 i {
      margin-right: 8px;
      color: #0052cc;
    }
  `]
})
export class AppComponent {}