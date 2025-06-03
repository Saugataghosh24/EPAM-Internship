// src/app/core/models/user.model.ts
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string; // Optional when returning to client
    region: string;
    country: string;
    profileImage?: string;
  }