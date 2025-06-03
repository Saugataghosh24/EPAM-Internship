// src/app/core/models/rating.model.ts
export interface Rating {
    userId: string;
    userName: string;
    userImage?: string;
    value: number;
    comment?: string;
    date: Date;
  }