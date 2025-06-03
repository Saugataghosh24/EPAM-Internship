// reviews.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

export interface Review {
  feedbackId: string;
  author: string;
  carImageUrl: string;
  carModel: string;
  date: string;
  feedbackText: string;
  orderHistory: string;
  rating: string;
}

export interface ReviewsResponse {
  content: Review[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private apiUrl = environment.apiBaseUrl+'feedbacks';

  constructor(private http: HttpClient) {}

  getUserReviews(userId: string): Observable<Review[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<ReviewsResponse>(`${this.apiUrl}/${userId}`, { headers })
      .pipe(
        map(response => response.content),
        catchError(this.handleError)
      );
  }

  // Helper method to get auth token
  private getToken(): string {
    return localStorage.getItem('token') || '';
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