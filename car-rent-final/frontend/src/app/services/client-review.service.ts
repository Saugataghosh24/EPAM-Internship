// src/app/services/client-review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map, tap, throwError } from 'rxjs';
import { ClientReview, ClientReviewResponse } from '../models/ClientReview.models';
import { environment } from '../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ClientReviewService {
  private apiUrl = environment.apiBaseUrl;
  private reviewsCache: ClientReview[] = []; // Cache to store all reviews
  private lastFetchTime = 0; // Timestamp of last fetch
  private cacheDuration = 60000; // Cache duration in milliseconds (1 minute)

  constructor(private http: HttpClient) {}


  getCarReviews(carId: string,params?:string): Observable<ClientReviewResponse> {
    return this.http.get<ClientReviewResponse>(`${this.apiUrl}cars/${carId}/client-review${params ? `?${params}` : ''}`).pipe(
      catchError(error => {
        console.error('Error fetching car reviews', error);
        return throwError(() => error);
      })
    )
  }

}