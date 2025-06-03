// src/app/core/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private localStorage: LocalStorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Initialize with null for server-side rendering
    let storedUser: User | null = null;
    
    // Only try to get from localStorage in browser
    if (this.isBrowser) {
      storedUser = this.localStorage.getItem<User>('currentUser');
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  register(user: User): boolean {
    if (!this.isBrowser) {
      return false; // Cannot register in server environment
    }
    
    const users = this.getUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === user.email)) {
      return false;
    }

    // Generate ID
    user.id = this.generateId();
    
    // Add to users array
    users.push(user);
    this.localStorage.setItem('users', users);
    
    return true;
  }

  login(email: string, password: string): boolean {
    if (!this.isBrowser) {
      return false; // Cannot login in server environment
    }
    
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Create a copy without password
      const { password: _, ...secureUser } = user;
      this.localStorage.setItem('currentUser', secureUser);
      this.currentUserSubject.next(secureUser);
      return true;
    }
    
    return false;
  }

  logout(): void {
    if (this.isBrowser) {
      this.localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  private getUsers(): User[] {
    if (!this.isBrowser) {
      return []; // Return empty array in server environment
    }
    return this.localStorage.getItem<User[]>('users') || [];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}