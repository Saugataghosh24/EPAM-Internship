// chat-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ChatParams } from '../../models/chat-params.model';

@Component({
  selector: 'app-chat-controls',
  template: `
    <div class="chat-controls">
      <div class="controls-header" (click)="toggleControls()">
        <span>AI Parameters</span>
        <i class="fas" [ngClass]="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </div>
      
      <div class="controls-body" *ngIf="isExpanded">
        <div class="control-group">
          <label>Temperature: {{ params.temperature }}</label>
          <div class="slider-container">
            <span class="slider-label">Precise</span>
            <input type="range" min="0" max="1" step="0.1" 
                  [(ngModel)]="params.temperature" 
                  (change)="onParamsChanged()">
            <span class="slider-label">Creative</span>
          </div>
        </div>
        
        <div class="control-group">
          <label>Agent:</label>
          <select [(ngModel)]="params.agent" (change)="onParamsChanged()">
            <option value="task-creator">Task Creator</option>
            <option value="project-manager">Project Manager</option>
            <option value="detail-oriented">Detail Oriented</option>
          </select>
        </div>
        
        <div class="control-group">
          <label>Max Tokens: {{ params.maxTokens }}</label>
          <input type="range" min="100" max="1000" step="100" 
                [(ngModel)]="params.maxTokens" 
                (change)="onParamsChanged()">
        </div>
        
        <div class="control-group">
          <label>Top P: {{ params.topP }}</label>
          <input type="range" min="0" max="1" step="0.1" 
                [(ngModel)]="params.topP" 
                (change)="onParamsChanged()">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-controls {
      font-size: 13px;
    }
    
    .controls-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      padding: 4px 0;
      color: #5e6c84;
      font-weight: 500;
    }
    
    .controls-body {
      margin-top: 8px;
    }
    
    .control-group {
      margin-bottom: 8px;
    }
    
    .control-group label {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      color: #5e6c84;
    }
    
    .slider-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .slider-label {
      font-size: 10px;
      color: #5e6c84;
    }
    
    input[type="range"] {
      flex: 1;
    }
    
    select {
      width: 100%;
      padding: 4px;
      border: 1px solid #dfe1e6;
      border-radius: 3px;
      font-size: 13px;
    }
  `]
})
export class ChatControlsComponent {
  @Input() params!: ChatParams;
  @Output() paramsChanged = new EventEmitter<ChatParams>();
  
  isExpanded = false;
  
  toggleControls() {
    this.isExpanded = !this.isExpanded;
  }
  
  onParamsChanged() {
    this.paramsChanged.emit({...this.params});
  }
}