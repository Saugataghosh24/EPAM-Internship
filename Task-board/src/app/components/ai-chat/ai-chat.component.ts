// ai-chat.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatParams } from '../../models/chat-params.model';
import { AiChatService } from '../../services/ai-chat.service';
import { TaskService } from '../../services/task.service';

interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
}

@Component({
  selector: 'app-ai-chat',
  template: `
    <div class="chat-interface">
      <div class="chat-messages" #chatMessages>
        <div *ngFor="let message of chatHistory" class="message"
          [ngClass]="{'user-message': message.sender === 'user', 'ai-message': message.sender === 'ai'}">
          <div class="message-avatar" *ngIf="message.sender === 'ai'">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-avatar" *ngIf="message.sender === 'user'">
            <i class="fas fa-user"></i>
          </div>
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
        
        <div *ngIf="isLoading" class="message ai-message">
          <div class="message-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-content typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <div *ngIf="chatHistory.length === 0" class="empty-chat">
          <p>Welcome to the AI Task Generator!</p>
          <p>Describe the tasks you need for your project, and I'll create them for you.</p>
          <div class="sample-prompts">
            <p>Try these examples:</p>
            <button class="sample-prompt-btn" (click)="useSamplePrompt('Create 3 tasks for a website redesign project')">
              Website Redesign Tasks
            </button>
            <button class="sample-prompt-btn" (click)="useSamplePrompt('Generate tasks for organizing a team hackathon')">
              Hackathon Planning
            </button>
          </div>
        </div>
      </div>
      
      <div class="chat-controls-panel">
        <app-chat-controls
          [params]="chatParams"
          (paramsChanged)="updateParams($event)">
        </app-chat-controls>
      </div>
      
      <div class="chat-input-container">
        <input 
          [(ngModel)]="userPrompt" 
          placeholder="Describe tasks to add (e.g., 'Create 3 tasks for a website redesign project')" 
          (keyup.enter)="sendPrompt()"
        />
        <button 
          class="send-button" 
          [disabled]="!userPrompt || isLoading" 
          (click)="sendPrompt()">
          <i class="fas fa-paper-plane"></i>
        </button>
        <button 
          class="sample-button" 
          [disabled]="isLoading" 
          title="Generate sample tasks"
          (click)="generateSampleTasks()">
          <i class="fas fa-magic"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-interface {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 440px;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .message {
      display: flex;
      gap: 8px;
      max-width: 80%;
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .user-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    
    .ai-message {
      align-self: flex-start;
    }
    
    .message-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: #0052cc;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .user-message .message-avatar {
      background-color: #6554c0;
    }
    
    .message-content {
      background-color: #f4f5f7;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 14px;
      color: #172b4d;
      line-height: 1.4;
    }
    
    .user-message .message-content {
      background-color: #deebff;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 16px;
    }
    
    .typing-indicator span {
      height: 8px;
      width: 8px;
      margin: 0 2px;
      background-color: #0052cc;
      border-radius: 50%;
      display: inline-block;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    
    .typing-indicator span:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    .chat-controls-panel {
      padding: 8px;
      border-top: 1px solid #dfe1e6;
      border-bottom: 1px solid #dfe1e6;
      background-color: #fafbfc;
    }
    
    .chat-input-container {
      display: flex;
      padding: 8px;
      background-color: white;
    }
    
    .chat-input-container input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #dfe1e6;
      border-radius: 3px;
      font-size: 14px;
    }
    
    .send-button, .sample-button {
      background-color: #0052cc;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 0 12px;
      margin-left: 8px;
      cursor: pointer;
    }
    
    .sample-button {
      background-color: #6554c0;
    }
    
    .send-button:disabled, .sample-button:disabled {
      background-color: #97a0af;
      cursor: not-allowed;
    }
    
    .empty-chat {
      text-align: center;
      color: #5e6c84;
      padding: 20px;
    }
    
    .sample-prompts {
      margin-top: 15px;
    }
    
    .sample-prompt-btn {
      background-color: #f4f5f7;
      border: 1px solid #dfe1e6;
      border-radius: 3px;
      padding: 6px 10px;
      margin: 5px;
      font-size: 12px;
      cursor: pointer;
      color: #172b4d;
    }
    
    .sample-prompt-btn:hover {
      background-color: #ebecf0;
    }
  `]
})
export class AiChatComponent implements OnInit {
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;
  
  chatParams: ChatParams = {
    temperature: 0.7,
    agent: 'task-creator',
    maxTokens: 500,
    topP: 0.9
  };
  
  userPrompt = '';
  chatHistory: ChatMessage[] = [];
  isLoading = false;
  
  constructor(private aiChatService: AiChatService, private taskService: TaskService) {}
  
  ngOnInit() {
    // Add a welcome message when the component initializes
    if (this.chatHistory.length === 0) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }
  
  updateParams(params: ChatParams) {
    this.chatParams = params;
  }
  
  useSamplePrompt(prompt: string) {
    this.userPrompt = prompt;
    this.sendPrompt();
  }
  
  generateSampleTasks() {
    // Add a message about generating sample tasks
    this.chatHistory.push({
      sender: 'user', 
      content: 'Generate some sample tasks for me'
    });
    
    // Show loading indicator
    this.isLoading = true;
    
    // Simulate a delay for the AI response
    setTimeout(() => {
      // Add AI response
      this.chatHistory.push({
        sender: 'ai', 
        content: 'I\'ve created some sample tasks for your board.'
      });
      
      // Generate sample tasks
      this.taskService.addSampleTasks();
      
      // Add a summary of added tasks
      this.chatHistory.push({
        sender: 'ai', 
        content: 'Added 3 sample tasks to your board: project setup, database design, and user authentication.'
      });
      
      this.isLoading = false;
      this.scrollToBottom();
    }, 1000);
  }
  
  sendPrompt() {
    if (!this.userPrompt.trim() || this.isLoading) return;
    
    const prompt = this.userPrompt.trim();
    this.userPrompt = '';
    
    // Add user message to chat
    this.chatHistory.push({sender: 'user', content: prompt});
    
    // Show loading indicator
    this.isLoading = true;
    this.scrollToBottom();
    
    // Call EPAM Dial API
    this.aiChatService.generateTasks(prompt, this.chatParams)
      .subscribe({
        next: (response) => {
          // Add AI response to chat
          this.chatHistory.push({sender: 'ai', content: response.message});
          
          // Add tasks to board
          if (response.tasks && response.tasks.length > 0) {
            this.taskService.addTasks(response.tasks);
            
            // Add a summary of added tasks
            const taskSummary = `Added ${response.tasks.length} ${response.tasks.length === 1 ? 'task' : 'tasks'} to your board.`;
            this.chatHistory.push({sender: 'ai', content: taskSummary});
          } else {
            this.chatHistory.push({
              sender: 'ai', 
              content: 'No tasks were created. Please try a different prompt.'
            });
          }
          
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error generating tasks:', error);
          
          // Add error message to chat
          this.chatHistory.push({
            sender: 'ai', 
            content: `Error: ${error.message || 'There was an error processing your request. Please try again.'}`
          });
          
          // Suggest using sample tasks
          this.chatHistory.push({
            sender: 'ai', 
            content: 'You can try generating sample tasks using the magic wand button instead.'
          });
          
          this.isLoading = false;
          this.scrollToBottom();
        }
      });
  }
  
  scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatMessagesRef) {
        const element = this.chatMessagesRef.nativeElement;
        element.scrollTop = element.scrollHeight;
      } else {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }, 0);
  }
}