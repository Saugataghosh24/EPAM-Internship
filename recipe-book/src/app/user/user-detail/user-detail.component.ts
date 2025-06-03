// src/app/user/user-detail/user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { User } from '../../core/models/user.model';
import { Recipe } from '../../core/models/recipe.model';
import { UserService } from '../../core/services/user.service';
import { RecipeService } from '../../core/services/recipe.service';
import { RecipeCardComponent } from '../../shared/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RecipeCardComponent // Import the RecipeCardComponent
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  userRecipes: Recipe[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private recipeService: RecipeService
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.router.navigate(['/']);
      return;
    }
    
    this.user = this.userService.getUserById(userId);
    if (!this.user) {
      this.router.navigate(['/']);
      return;
    }
    
    // Make sure the method name matches what's in your RecipeService
    // If it's getUserRecipes instead of getRecipesByUser, use that
    this.userRecipes = this.recipeService.getUserRecipes(userId);
  }

  addToFavorites(recipeId: string): void {
    // This would be implemented with a user favorites service
    console.log(`Add recipe ${recipeId} to favorites`);
  }
}