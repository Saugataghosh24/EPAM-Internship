import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map,Observable, catchError,throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment.prod';
export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  idToken: string;
  role: string;
  userId: string;
  userImageUrl: string | null;
  username: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
 
  private baseUrl =  environment.apiBaseUrl;

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
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/sign-up`, payload).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/sign-in`, payload).pipe(
      map((response) => {
        if (this.isBrowser()) {
          sessionStorage.setItem('token', response.idToken);
          sessionStorage.setItem('user', JSON.stringify(response));
        }
        this.currentUserSubject.next(response);
        return response;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error.message || 'Login failed'));
      })
    );
  }

  logout() {
    if(this.isBrowser()){
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
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

  getAllUsers(){
    return this.http.get<any>(`${this.baseUrl}/users/clients`);
  }
}