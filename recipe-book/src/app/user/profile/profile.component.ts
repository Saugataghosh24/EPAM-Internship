// src/app/user/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../core/models/user.model';
import { Recipe } from '../../core/models/recipe.model';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { RecipeService } from '../../core/services/recipe.service';
import { RatingComponent } from '../../shared/components/rating/rating.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RatingComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  userRecipes: Recipe[] = [];
  
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private recipeService: RecipeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      
      this.currentUser = user;
      this.loadUserRecipes();
    });
  }

  loadUserRecipes(): void {
    if (this.currentUser) {
      this.userRecipes = this.recipeService.getUserRecipes(this.currentUser.id);
    }
  }

  navigateToAddRecipe(): void {
    this.router.navigate(['/recipes/add']);
  }

  editRecipe(recipeId: string): void {
    this.router.navigate(['/recipes/edit', recipeId]);
  }

  deleteRecipe(recipeId: string): void {
    if (confirm('Are you sure you want to delete this recipe?')) {
      const success = this.recipeService.deleteRecipe(recipeId);
      if (success) {
        this.loadUserRecipes();
      }
    }
  }
}