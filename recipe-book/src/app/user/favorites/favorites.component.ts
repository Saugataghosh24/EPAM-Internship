// src/app/user/favorites/favorites.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Recipe } from '../../core/models/recipe.model';
import { AuthService } from '../../core/services/auth.service';
import { RecipeService } from '../../core/services/recipe.service';
import { UserFavoritesService } from '../../core/services/user-favorites.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RecipeCardComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favoriteRecipes: Recipe[] = [];
  
  constructor(
    private authService: AuthService,
    private recipeService: RecipeService,
    private favoritesService: UserFavoritesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.loadFavoriteRecipes();
  }

  loadFavoriteRecipes(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;
    
    const favoriteIds = this.favoritesService.getUserFavorites(currentUser.id);
    console.log('Favorite recipe IDs:', favoriteIds);
    
    // Get full recipe objects for each ID
    this.favoriteRecipes = favoriteIds
      .map(id => this.recipeService.getRecipeById(id))
      .filter((recipe): recipe is Recipe => recipe !== null);
    
    console.log('Favorite recipes loaded:', this.favoriteRecipes.length);
  }

  toggleFavorite(recipeId: string): void {
    const success = this.favoritesService.toggleFavorite(recipeId);
    if (success) {
      // Reload favorites to reflect changes
      this.loadFavoriteRecipes();
    }
  }
}