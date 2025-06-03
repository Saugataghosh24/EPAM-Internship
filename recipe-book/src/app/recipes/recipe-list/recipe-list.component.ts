// src/app/recipes/recipe-list/recipe-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Recipe } from '../../core/models/recipe.model';
import { RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';
import { UserFavoritesService } from '../../core/services/user-favorites.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RecipeCardComponent,
    TruncatePipe
  ],
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  
  searchQuery = '';
  cuisineTypes = ['American', 'Italian', 'Spanish', 'Lebanese', 'Chinese', 'Thai', 'Indian', 'French', 'Mexican', 'Mediterranean', 'Irish'];
  categories = ['Appetizer', 'Main Course', 'Dessert', 'Soup', 'Salad', 'Breakfast', 'Snack'];
  difficultyLevels = ['Easy', 'Medium', 'Hard'];
  
  filters = {
    cuisineType: '',
    category: '',
    difficultyLevel: '',
    cookingTime: 0
  };
  
  sortBy: 'latest' | 'popular' = 'popular';
  
  isFilterMenuOpen = false;
  isLoggedIn = false;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private favoritesService: UserFavoritesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to recipes
    this.recipeService.recipes$.subscribe(recipes => {
      this.recipes = recipes;
      this.applyFilters();
    });
    
    // Subscribe to auth state
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  toggleFilterMenu(): void {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  applyFilters(): void {
    // Start with all recipes
    let result = this.recipes;
    
    // Apply search if provided
    if (this.searchQuery.trim()) {
      result = this.recipeService.searchRecipes(this.searchQuery);
    }
    
    // Apply filters
    const activeFilters = Object.entries(this.filters)
      .filter(([_, value]) => value)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    if (Object.keys(activeFilters).length > 0) {
      result = this.recipeService.filterRecipes(activeFilters);
    }
    
    // Apply sorting
    result = this.recipeService.sortRecipes(result, this.sortBy);
    
    this.filteredRecipes = result;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      cuisineType: '',
      category: '',
      difficultyLevel: '',
      cookingTime: 0
    };
    this.applyFilters();
  }

  toggleFavorite(recipeId: string): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    const success = this.favoritesService.toggleFavorite(recipeId);
    if (success) {
      console.log(`Toggled favorite status for recipe ${recipeId}`);
    } else {
      console.error(`Failed to toggle favorite status for recipe ${recipeId}`);
    }
  }
}