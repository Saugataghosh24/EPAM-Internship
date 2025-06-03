// src/app/recipes/recipe-detail/recipe-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Recipe } from '../../core/models/recipe.model';
import { Rating } from '../../core/models/rating.model';
import { RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';
import { RatingComponent } from '../../shared/components/rating/rating.component';
import { UserFavoritesService } from '../../core/services/user-favorites.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RatingComponent
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  isOwner = false;
  isLoggedIn = false;
  isFavorite = false;
  userRating = 0;
  commentText = '';
  showRatingForm = false;
  existingUserRating: Rating | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private authService: AuthService,
    private favoritesService: UserFavoritesService
  ) { }

  ngOnInit(): void {
    this.loadRecipe();
    
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      
      if (this.recipe && user) {
        this.isOwner = this.recipe.userId === user.id;
        this.isFavorite = this.favoritesService.isFavorite(user.id, this.recipe.id);
        
        // Check if user has already rated
        this.existingUserRating = this.recipeService.getUserRatingWithComment(this.recipe.id, user.id);
        if (this.existingUserRating) {
          this.userRating = this.existingUserRating.value;
          this.commentText = this.existingUserRating.comment || '';
        } else {
          this.userRating = 0;
          this.commentText = '';
        }
      }
    });
  }

  loadRecipe(): void {
    const recipeId = this.route.snapshot.paramMap.get('id');
    if (!recipeId) {
      this.router.navigate(['/recipes']);
      return;
    }
    
    const recipe = this.recipeService.getRecipeById(recipeId);
    if (!recipe) {
      this.router.navigate(['/recipes']);
      return;
    }
    
    this.recipe = recipe;
    
    // Check user rating if logged in
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.existingUserRating = this.recipeService.getUserRatingWithComment(recipe.id, currentUser.id);
      if (this.existingUserRating) {
        this.userRating = this.existingUserRating.value;
        this.commentText = this.existingUserRating.comment || '';
      }
    }
  }

  onRatingChange(rating: number): void {
    if (!this.isLoggedIn || !this.recipe) {
      return;
    }
    
    this.userRating = rating;
  }

  toggleRatingForm(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    if (this.isOwner) {
      console.error('You cannot rate your own recipe');
      return;
    }
    
    this.showRatingForm = !this.showRatingForm;
  }

  submitRating(): void {
    if (!this.isLoggedIn || !this.recipe || this.userRating === 0) {
      return;
    }
    
    const success = this.recipeService.rateRecipe(this.recipe.id, this.userRating, this.commentText.trim() || undefined);
    
    if (success) {
      this.showRatingForm = false;
      this.loadRecipe(); // Reload to get updated ratings
      console.log('Rating submitted successfully');
    }
  }

  removeRating(): void {
    if (!this.isLoggedIn || !this.recipe) {
      return;
    }
    
    if (confirm('Are you sure you want to remove your rating?')) {
      const success = this.recipeService.removeRating(this.recipe.id);
      
      if (success) {
        this.userRating = 0;
        this.commentText = '';
        this.existingUserRating = null;
        this.loadRecipe(); // Reload to get updated ratings
        console.log('Rating removed successfully');
      }
    }
  }

  navigateToOwnerProfile(): void {
    if (this.recipe) {
      this.router.navigate(['/users', this.recipe.userId]);
    }
  }

  editRecipe(): void {
    if (!this.recipe) {
      return;
    }
    
    if (!this.isOwner) {
      console.error('User does not have permission to edit this recipe');
      return;
    }
    
    console.log('Navigating to edit recipe:', this.recipe.id);
    this.router.navigate(['/recipes/edit', this.recipe.id]);
  }

  deleteRecipe(): void {
    if (!this.recipe) {
      return;
    }
    
    if (!this.isOwner) {
      console.error('User does not have permission to delete this recipe');
      return;
    }
    
    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      const success = this.recipeService.deleteRecipe(this.recipe.id);
      if (success) {
        this.router.navigate(['/recipes']);
      }
    }
  }

  toggleFavorite(): void {
    if (!this.isLoggedIn || !this.recipe) {
      if (!this.isLoggedIn) {
        this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      }
      return;
    }
    
    const success = this.favoritesService.toggleFavorite(this.recipe.id);
    if (success) {
      this.isFavorite = !this.isFavorite;
      console.log(`Recipe ${this.recipe.id} is ${this.isFavorite ? 'now' : 'no longer'} a favorite`);
    }
  }
  
  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const result: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        result.push(1); // Full star
      } else if (i === fullStars && rating % 1 >= 0.5) {
        result.push(0.5); // Half star
      } else {
        result.push(0); // Empty star
      }
    }
    
    return result;
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }


navigateToUserProfile(userId: string): void {
  if (userId) {
    this.router.navigate(['/user', userId]);
  }
}

navigateToLogin(): void {
  this.router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: this.router.url } 
  });
}
}