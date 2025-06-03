// src/app/recipes/my-recipes/my-recipes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Recipe } from '../../core/models/recipe.model';
import { RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';
import { UserFavoritesService } from '../../core/services/user-favorites.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-my-recipes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RecipeCardComponent
  ],
  templateUrl: './my-recipes.component.html',
  styleUrls: ['./my-recipes.component.css']
})
export class MyRecipesComponent implements OnInit {
  userRecipes: Recipe[] = [];

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private favoritesService: UserFavoritesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadUserRecipes(currentUser.id);
  }

  loadUserRecipes(userId: string): void {
    this.userRecipes = this.recipeService.getUserRecipes(userId);
    console.log(`Loaded ${this.userRecipes.length} recipes for user ${userId}`);
  }

  toggleFavorite(recipeId: string): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    this.favoritesService.toggleFavorite(recipeId);
  }
}