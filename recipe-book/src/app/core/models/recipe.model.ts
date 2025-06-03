// src/app/core/models/recipe.model.ts
import { Rating } from './rating.model';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  steps: string[];
  userId: string;
  userName: string;
  userImage?: string;
  cuisineType: string;
  category: string;
  tags: string[];
  ingredients: string[];
  difficultyLevel: string;
  cookingTime: number;
  dietaryRestrictions: string[];
  imageUrl: string;
  dateCreated: Date;
  ratings: Rating[];
  averageRating: number;
}