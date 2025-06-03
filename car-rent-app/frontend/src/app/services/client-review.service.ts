// src/app/services/client-review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map, tap } from 'rxjs';
import { ClientReview } from '../models/ClientReview.models';


@Injectable({
  providedIn: 'root'
})
export class ClientReviewService {
  private apiUrl = 'http://localhost:3000/ClientReview';
  private reviewsCache: ClientReview[] = []; // Cache to store all reviews
  private lastFetchTime = 0; // Timestamp of last fetch
  private cacheDuration = 60000; // Cache duration in milliseconds (1 minute)

  constructor(private http: HttpClient) {}

  // Get all reviews
  getAllReviews(): Observable<ClientReview[]> {
    const now = Date.now();
    
    // If we have cached reviews and they're still fresh, use them
    if (this.reviewsCache.length > 0 && (now - this.lastFetchTime) < this.cacheDuration) {
      return of(this.reviewsCache);
    }
    
    // Otherwise, fetch from the server
    return this.http.get<ClientReview[]>(this.apiUrl).pipe(
      map(reviews => reviews.map(review => this.normalizeReview(review))),
      tap(reviews => {
        console.log(`Fetched ${reviews.length} reviews`);
        this.reviewsCache = reviews;
        this.lastFetchTime = now;
      }),
      catchError(error => {
        console.error('Error fetching reviews:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  // Get all reviews for a specific car
  getCarReviews(carId: string): Observable<ClientReview[]> {
    return this.getAllReviews().pipe(
      map(reviews => reviews.filter(review => review.carId === carId)),
      tap(reviews => console.log(`Found ${reviews.length} reviews for car ${carId}`))
    );
  }

  // Add a new review (for future implementation)
  addReview(review: Omit<ClientReview, 'id'>): Observable<ClientReview> {
    return this.http.post<ClientReview>(this.apiUrl, review).pipe(
      tap(newReview => {
        console.log('Added new review:', newReview);
        // Update the cache
        this.reviewsCache.push(this.normalizeReview(newReview));
      }),
      catchError(error => {
        console.error('Error adding review:', error);
        throw error;
      })
    );
  }

  // Get the average rating for a car
  getAverageRating(carId: string): Observable<number> {
    return this.getCarReviews(carId).pipe(
      map(reviews => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((total, item) => total + parseFloat(item.rentalExperience), 0);
        return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
      })
    );
  }

  // Get the total number of reviews for a car
  getReviewCount(carId: string): Observable<number> {
    return this.getCarReviews(carId).pipe(
      map(reviews => reviews.length)
    );
  }

  // Helper method to ensure all review objects have the required properties
  private normalizeReview(review: ClientReview): ClientReview {
    if (!review.authorInitial && review.author) {
      review.authorInitial = review.author.charAt(0).toUpperCase();
    }
    
    // Convert rating to string if it's a number
    // if (typeof review.rentalExperience === 'number') {
    //   review.rentalExperience = review.rentalExperience.toString();
    // }
    
    return review;
  }
}