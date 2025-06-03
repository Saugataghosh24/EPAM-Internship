// src/app/core/services/user-favorites.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LocalStorageService } from './local-storage.service';
import { AuthService } from './auth.service';

interface UserFavorites {
  userId: string;
  recipeIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserFavoritesService {
  private favoritesSubject: BehaviorSubject<UserFavorites[]>;
  public favorites$: Observable<UserFavorites[]>;
  private isBrowser: boolean;

  constructor(
    private localStorage: LocalStorageService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Initialize with empty array for server-side rendering
    let storedFavorites: UserFavorites[] = [];
    
    // Only try to get from localStorage in browser
    if (this.isBrowser) {
      storedFavorites = this.localStorage.getItem<UserFavorites[]>('userFavorites') || [];
    }
    
    this.favoritesSubject = new BehaviorSubject<UserFavorites[]>(storedFavorites);
    this.favorites$ = this.favoritesSubject.asObservable();
  }

  getUserFavorites(userId: string): string[] {
    const userFavorites = this.favoritesSubject.value.find(f => f.userId === userId);
    return userFavorites ? userFavorites.recipeIds : [];
  }

  isFavorite(userId: string, recipeId: string): boolean {
    const userFavorites = this.getUserFavorites(userId);
    return userFavorites.includes(recipeId);
  }

  toggleFavorite(recipeId: string): boolean {
    if (!this.isBrowser) return false;
    
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    const favorites = this.favoritesSubject.value;
    let userFavorites = favorites.find(f => f.userId === currentUser.id);
    
    if (!userFavorites) {
      // Create new user favorites entry
      userFavorites = {
        userId: currentUser.id,
        recipeIds: []
      };
      favorites.push(userFavorites);
    }
    
    const index = userFavorites.recipeIds.indexOf(recipeId);
    
    if (index === -1) {
      // Add to favorites
      userFavorites.recipeIds.push(recipeId);
      console.log(`Added recipe ${recipeId} to favorites for user ${currentUser.id}`);
    } else {
      // Remove from favorites
      userFavorites.recipeIds.splice(index, 1);
      console.log(`Removed recipe ${recipeId} from favorites for user ${currentUser.id}`);
    }
    
    try {
      this.localStorage.setItem('userFavorites', favorites);
      this.favoritesSubject.next(favorites);
      return true;
    } catch (error) {
      console.error('Error updating favorites:', error);
      return false;
    }
  }
}