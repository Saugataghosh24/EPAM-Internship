// ai-chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatParams } from '../models/chat-params.model';
import { Task } from '../models/task.model';

export interface AiChatResponse {
  message: string;
  tasks: Task[];
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  constructor(private http: HttpClient) {}
  
  // This method will generate tasks based on the user's prompt
  generateTasks(prompt: string, params: ChatParams): Observable<AiChatResponse> {
    console.log('Generating tasks with prompt:', prompt, 'and params:', params);
    
    // For now, we'll create mock tasks based on the prompt
    // Later this will be replaced with the actual EPAM Dial API call
    const mockTasks: Task[] = this.createTasksFromPrompt(prompt);
    
    const mockResponse: AiChatResponse = {
      message: `I've created some tasks based on your request: "${prompt}"`,
      tasks: mockTasks
    };
    
    // Simulate API delay
    return of(mockResponse).pipe(delay(1500));
  }
  
  // Helper method to create tasks from the prompt
  private createTasksFromPrompt(prompt: string): Task[] {
    // Extract potential task names from the prompt
    const lowercasePrompt = prompt.toLowerCase();
    const tasks: Task[] = [];
    
    // Generate different tasks based on common keywords in the prompt
    if (lowercasePrompt.includes('website') || lowercasePrompt.includes('web')) {
      tasks.push(
        {
          id: '',
          name: 'Design website mockups',
          description: 'Create mockups for the website using Figma or Adobe XD',
          dueDate: new Date(Date.now() + 3 * 86400000), // 3 days from now
          status: 'TODO',
          category: 'Design',
          assignee: ''
        },
        {
          id: '',
          name: 'Set up website repository',
          description: 'Initialize Git repository and set up project structure',
          dueDate: new Date(Date.now() + 1 * 86400000), // 1 day from now
          status: 'TODO',
          category: 'Development',
          assignee: ''
        },
        {
          id: '',
          name: 'Implement responsive layout',
          description: 'Create responsive HTML/CSS layout based on the approved designs',
          dueDate: new Date(Date.now() + 5 * 86400000), // 5 days from now
          status: 'TODO',
          category: 'Development',
          assignee: ''
        }
      );
    }
    
    if (lowercasePrompt.includes('app') || lowercasePrompt.includes('mobile')) {
      tasks.push(
        {
          id: '',
          name: 'Create app wireframes',
          description: 'Design wireframes for the mobile application',
          dueDate: new Date(Date.now() + 2 * 86400000), // 2 days from now
          status: 'TODO',
          category: 'Design',
          assignee: ''
        },
        {
          id: '',
          name: 'Set up development environment',
          description: 'Install and configure necessary tools and dependencies',
          dueDate: new Date(Date.now() + 1 * 86400000), // 1 day from now
          status: 'TODO',
          category: 'Setup',
          assignee: ''
        }
      );
    }
    
    if (lowercasePrompt.includes('meeting') || lowercasePrompt.includes('presentation')) {
      tasks.push(
        {
          id: '',
          name: 'Prepare presentation slides',
          description: 'Create slides for the upcoming meeting',
          dueDate: new Date(Date.now() + 2 * 86400000), // 2 days from now
          status: 'TODO',
          category: 'Meeting',
          assignee: ''
        },
        {
          id: '',
          name: 'Schedule meeting with stakeholders',
          description: 'Coordinate with all participants and send calendar invites',
          dueDate: new Date(Date.now() + 1 * 86400000), // 1 day from now
          status: 'TODO',
          category: 'Planning',
          assignee: ''
        }
      );
    }
    
    if (lowercasePrompt.includes('hackathon')) {
      tasks.push(
        {
          id: '',
          name: 'Define hackathon theme',
          description: 'Brainstorm and select a theme for the hackathon',
          dueDate: new Date(Date.now() + 2 * 86400000), // 2 days from now
          status: 'TODO',
          category: 'Planning',
          assignee: ''
        },
        {
          id: '',
          name: 'Set up judging criteria',
          description: 'Define how projects will be evaluated',
          dueDate: new Date(Date.now() + 3 * 86400000), // 3 days from now
          status: 'TODO',
          category: 'Planning',
          assignee: ''
        },
        {
          id: '',
          name: 'Prepare technical infrastructure',
          description: 'Ensure all necessary tools and platforms are available',
          dueDate: new Date(Date.now() + 5 * 86400000), // 5 days from now
          status: 'TODO',
          category: 'Technical',
          assignee: ''
        },
        {
          id: '',
          name: 'Create participant guidelines',
          description: 'Document rules, schedule, and resources for participants',
          dueDate: new Date(Date.now() + 4 * 86400000), // 4 days from now
          status: 'TODO',
          category: 'Documentation',
          assignee: ''
        }
      );
    }
    
    // If no specific tasks were created, generate generic ones
    if (tasks.length === 0) {
      tasks.push(
        {
          id: '',
          name: 'Task 1: ' + prompt.substring(0, 30),
          description: 'Task generated from your prompt: ' + prompt,
          dueDate: new Date(Date.now() + 2 * 86400000), // 2 days from now
          status: 'TODO',
          category: 'Generated',
          assignee: ''
        },
        {
          id: '',
          name: 'Task 2: Follow-up',
          description: 'Additional task related to your request',
          dueDate: new Date(Date.now() + 4 * 86400000), // 4 days from now
          status: 'TODO',
          category: 'Generated',
          assignee: ''
        }
      );
    }
    
    return tasks;
  }
}