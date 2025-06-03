// src/app/core/services/recipe.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Recipe } from '../models/recipe.model';
import { Rating } from '../models/rating.model';
import { LocalStorageService } from './local-storage.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesSubject: BehaviorSubject<Recipe[]>;
  public recipes$: Observable<Recipe[]>;

  constructor(
    private localStorage: LocalStorageService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.recipesSubject = new BehaviorSubject<Recipe[]>(
      this.localStorage.getItem<Recipe[]>('recipes') || []
    );
    this.recipes$ = this.recipesSubject.asObservable();
  }

  getAllRecipes(): Recipe[] {
    return this.recipesSubject.value;
  }

  getRecipeWithUserInfo(recipe: Recipe): Recipe {
    const user = this.userService.getUserById(recipe.userId);
    return {
      ...recipe,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
      userImage: user?.profileImage
    };
  }

  getRecipeById(id: string): Recipe | null {
    const recipes = this.recipesSubject.value;
    const recipe = recipes.find(recipe => recipe.id === id);
    return recipe ? this.getRecipeWithUserInfo(recipe) : null;
  }

  getUserRecipes(userId: string): Recipe[] {
    const recipes = this.recipesSubject.value;
    return recipes
      .filter(recipe => recipe.userId === userId)
      .map(recipe => this.getRecipeWithUserInfo(recipe));
  }

  addRecipe(recipe: Partial<Recipe>): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    const newRecipe: Recipe = {
      id: this.generateId(),
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userImage: currentUser.profileImage,
      dateCreated: new Date(),
      ratings: [],
      averageRating: 0,
      ...recipe
    } as Recipe;

    const recipes = this.getAllRecipes();
    recipes.push(newRecipe);
    
    this.localStorage.setItem('recipes', recipes);
    this.recipesSubject.next(recipes);
    return true;
  }

  updateRecipe(updatedRecipe: Recipe): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    const recipes = this.getAllRecipes();
    const index = recipes.findIndex(r => r.id === updatedRecipe.id);
    
    if (index === -1 || recipes[index].userId !== currentUser.id) {
      return false;
    }

    // Preserve ratings and other metadata
    const { ratings, averageRating, userId, userName, userImage, dateCreated } = recipes[index];
    recipes[index] = { 
      ...updatedRecipe,
      ratings,
      averageRating,
      userId,
      userName,
      userImage,
      dateCreated
    };
    
    this.localStorage.setItem('recipes', recipes);
    this.recipesSubject.next(recipes);
    return true;
  }

  deleteRecipe(id: string): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    const recipes = this.getAllRecipes();
    const recipe = recipes.find(r => r.id === id);
    
    if (!recipe || recipe.userId !== currentUser.id) {
      return false;
    }

    const updatedRecipes = recipes.filter(r => r.id !== id);
    
    this.localStorage.setItem('recipes', updatedRecipes);
    this.recipesSubject.next(updatedRecipes);
    return true;
  }

  // Enhanced rating methods
  
  rateRecipe(recipeId: string, rating: number, comment?: string): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    const recipes = this.getAllRecipes();
    const index = recipes.findIndex(r => r.id === recipeId);
    
    if (index === -1) return false;
    
    // Check if user is the recipe owner
    if (recipes[index].userId === currentUser.id) {
      console.error("You cannot rate your own recipe");
      return false;
    }

    // Remove previous rating by this user if exists
    const userRatingIndex = recipes[index].ratings.findIndex(r => r.userId === currentUser.id);
    if (userRatingIndex !== -1) {
      recipes[index].ratings.splice(userRatingIndex, 1);
    }

    // Add new rating
    recipes[index].ratings.push({
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      userImage: currentUser.profileImage,
      value: rating,
      comment,
      date: new Date()
    });

    // Calculate average rating
    this.updateAverageRating(recipes[index]);

    this.localStorage.setItem('recipes', recipes);
    this.recipesSubject.next(recipes);
    return true;
  }
  
  getUserRating(recipeId: string, userId: string): number {
    const recipe = this.getRecipeById(recipeId);
    if (!recipe) return 0;
    
    const userRating = recipe.ratings.find(r => r.userId === userId);
    return userRating ? userRating.value : 0;
  }
  
  getUserRatingWithComment(recipeId: string, userId: string): Rating | null {
    const recipe = this.getRecipeById(recipeId);
    if (!recipe) return null;
    
    return recipe.ratings.find(r => r.userId === userId) || null;
  }
  
  removeRating(recipeId: string): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;

    const recipes = this.getAllRecipes();
    const index = recipes.findIndex(r => r.id === recipeId);
    
    if (index === -1) return false;

    // Find and remove the rating
    const ratingIndex = recipes[index].ratings.findIndex(r => r.userId === currentUser.id);
    
    if (ratingIndex === -1) {
      console.error('Rating not found');
      return false;
    }
    
    recipes[index].ratings.splice(ratingIndex, 1);
    
    // Recalculate average rating
    this.updateAverageRating(recipes[index]);
    
    this.localStorage.setItem('recipes', recipes);
    this.recipesSubject.next(recipes);
    return true;
  }
  
  private updateAverageRating(recipe: Recipe): void {
    if (recipe.ratings.length === 0) {
      recipe.averageRating = 0;
      return;
    }
    
    const sum = recipe.ratings.reduce((total, rating) => total + rating.value, 0);
    recipe.averageRating = parseFloat((sum / recipe.ratings.length).toFixed(1));
  }

  searchRecipes(query: string): Recipe[] {
    if (!query.trim()) return this.getAllRecipes();
    
    query = query.toLowerCase().trim();
    return this.getAllRecipes().filter(recipe => 
      recipe.name.toLowerCase().includes(query) ||
      recipe.cuisineType.toLowerCase().includes(query) ||
      recipe.category.toLowerCase().includes(query) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  filterRecipes(filters: {
    cuisineType?: string,
    category?: string,
    difficultyLevel?: string,
    cookingTime?: number
  }): Recipe[] {
    return this.getAllRecipes().filter(recipe => {
      let match = true;
      
      if (filters.cuisineType && recipe.cuisineType !== filters.cuisineType) {
        match = false;
      }
      if (filters.category && recipe.category !== filters.category) {
        match = false;
      }
      if (filters.difficultyLevel && recipe.difficultyLevel !== filters.difficultyLevel) {
        match = false;
      }
      if (filters.cookingTime && recipe.cookingTime > filters.cookingTime) {
        match = false;
      }
      
      return match;
    });
  }

  sortRecipes(recipes: Recipe[], sortBy: 'latest' | 'popular'): Recipe[] {
    const sortedRecipes = [...recipes];
    
    if (sortBy === 'latest') {
      return sortedRecipes.sort((a, b) => 
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );
    } else {
      return sortedRecipes.sort((a, b) => b.averageRating - a.averageRating);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Method to initialize sample data for demo purposes
  initSampleData(): void {
    if (this.getAllRecipes().length === 0) {
      const sampleRecipes: Recipe[] = [
        // Sample recipes would go here
      ];
      this.localStorage.setItem('recipes', sampleRecipes);
      this.recipesSubject.next(sampleRecipes);
    }
  }
  
  // Get top rated recipes
  getTopRatedRecipes(limit: number = 5): Recipe[] {
    return this.getAllRecipes()
      .filter(recipe => recipe.averageRating > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit)
      .map(recipe => this.getRecipeWithUserInfo(recipe));
  }
  
  // Get most recent recipes
  getRecentRecipes(limit: number = 5): Recipe[] {
    return this.getAllRecipes()
      .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
      .slice(0, limit)
      .map(recipe => this.getRecipeWithUserInfo(recipe));
  }
  
}