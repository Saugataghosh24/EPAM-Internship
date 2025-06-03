// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { LocalStorageService } from './local-storage.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private localStorage: LocalStorageService,
    private authService: AuthService
  ) {}

  getUserById(userId: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      // Return without password
      const { password, ...secureUser } = user;
      return secureUser as User;
    }
    
    return null;
  }

  updateUser(updatedUser: User): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || currentUser.id !== updatedUser.id) {
      return false;
    }

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index === -1) {
      return false;
    }

    // Preserve password
    const password = users[index].password;
    users[index] = { ...updatedUser, password };
    
    this.localStorage.setItem('users', users);
    
    // Update current user
    const { password: _, ...secureUser } = users[index];
    this.localStorage.setItem('currentUser', secureUser);
    
    return true;
  }

  private getUsers(): User[] {
    return this.localStorage.getItem<User[]>('users') || [];
  }
}