// src/app/models/chat-params.model.ts
export interface ChatParams {
    temperature: number;
    agent: string;
    maxTokens: number;
    topP: number;
  }