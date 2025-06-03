// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

export interface User {
  userId: string;
  username: string;
  userImageUrl?: string;
  role: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordChangeResponse {
  idToken: string;
  role: string;
  userId: string;
  userImageUrl: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiBaseUrl+'/users'; // Base API URL

  constructor(private http: HttpClient) {}

  // Get user by ID
  getUserById(userId: string): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<User>(`${this.apiUrl}/${userId}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Change user password
  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<PasswordChangeResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    const passwordData: PasswordChangeRequest = {
      oldPassword,
      newPassword
    };

    return this.http.put<PasswordChangeResponse>(
      `${this.apiUrl}/${userId}/change-password`,
      passwordData,
      { headers }
    ).pipe(catchError(this.handleError));
  }

  // Helper method to get auth token
  private getToken(): string {
    return sessionStorage.getItem('token') || '';
  }

  // Error handling
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || 'Something went wrong. Please try again later.';
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}