import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { createMockJwt } from './jwt.util';
import * as CryptoJS from 'crypto-js';
import { map,Observable, catchError,throwError, BehaviorSubject } from 'rxjs';

export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginResponse {
  idToken: string;
  role: string;
  userId: string;
  userImageUrl: string;
  username: string;
  email: string;
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/users';

  // Add BehaviorSubject for current user
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getInitialUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    if (this.isBrowser()) {
      const storedUser = sessionStorage.getItem('user');
      this.currentUserSubject.next(storedUser ? JSON.parse(storedUser) : null);
    }
  }
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  } 
  
  // Helper method to get initial user state
  private getInitialUser(): LoginResponse | null {
    if (this.isBrowser()) {
      const user = sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.baseUrl}?email=${email}`).pipe(
      map(users => users.length > 0),
      catchError(error => {
        console.error('Error checking email:', error);
        return throwError(() => new Error('Unable to check email availability'));
      })
    );
  }


  register(user: RegisterPayload): Observable<any> {
    const passwordHash = CryptoJS.SHA256(user.password).toString();
    const newUser = {
      ...user,
      password: passwordHash,
      username: `${user.firstName} ${user.lastName}`,
      role: 'Client',
      userId: crypto.randomUUID(),
      userImageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName.charAt(0)}${user.lastName.charAt(0)}` 
    };
    return this.http.post(this.baseUrl, newUser);
  }
  login(email: string, password: string): Observable<LoginResponse> {
    const passwordHash = CryptoJS.SHA256(password).toString();

    return this.http
      .get<any[]>(`${this.baseUrl}?email=${email}&password=${passwordHash}`)
      .pipe(
        map(users => {
          if (users.length === 0) {
            throw new Error('Invalid credentials');
          }
          const user = users[0];
          const idToken = createMockJwt({
            sub: user.userId,
            name: user.username,
            email: user.email
          });
          const loginResponse: LoginResponse = {
            idToken,
            role: user.role,
            userId: user.userId,
            userImageUrl: user.userImageUrl,
            username: user.username,
            email: user.email
          };
          // Store in session
          if (this.isBrowser()) {
            sessionStorage.setItem('token', idToken);
            sessionStorage.setItem('user', JSON.stringify(loginResponse));
          }
          // Update the current user subject
          this.currentUserSubject.next(loginResponse);
          return loginResponse;
        })
      );
  }

  logout() {
    if(this.isBrowser()){
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
    // Update the current user subject
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean{
    if(this.isBrowser()){
      return !!sessionStorage.getItem('token');
    }
    else return false;
  }

  getUser(): LoginResponse | null {
    if(this.isBrowser()){
      const user = sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    else return null;
  }

  getToken(): string | null {
    if(this.isBrowser()) return sessionStorage.getItem('token');
    else return null;
  }
}