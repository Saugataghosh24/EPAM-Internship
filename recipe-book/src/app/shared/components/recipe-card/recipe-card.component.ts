// src/app/shared/components/recipe-card/recipe-card.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Recipe } from '../../../core/models/recipe.model';
import { AuthService } from '../../../core/services/auth.service';
import { UserFavoritesService } from '../../../core/services/user-favorites.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TruncatePipe
  ],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.css']
})
export class RecipeCardComponent implements OnInit, OnChanges {
  @Input() recipe!: Recipe;
  @Output() favoriteToggle = new EventEmitter<string>();
  
  isLoggedIn = false;
  isFavorite = false;

  constructor(
    private authService: AuthService,
    private favoritesService: UserFavoritesService
  ) {}

  ngOnInit(): void {
    this.checkAuthAndFavoriteStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipe'] && !changes['recipe'].firstChange) {
      this.checkFavoriteStatus();
    }
  }

  private checkAuthAndFavoriteStatus(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      
      if (user && this.recipe) {
        this.checkFavoriteStatus();
      }
    });
  }

  private checkFavoriteStatus(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && this.recipe) {
      this.isFavorite = this.favoritesService.isFavorite(currentUser.id, this.recipe.id);
    }
  }

  toggleFavorite(event: Event): void {
    // Prevent navigation when clicking the favorite button
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.isLoggedIn) {
      return;
    }
    
    this.favoriteToggle.emit(this.recipe.id);
    
    // Update local state immediately for better UX
    this.isFavorite = !this.isFavorite;
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
  
}