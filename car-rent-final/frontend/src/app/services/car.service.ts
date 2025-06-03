import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CarBriefInfoResponse } from '../models/CarBriefInfo.model';
import { CarBookedDaysResponseBody, CarDetailsResponseBody } from '../models/CarDetails.models';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = `${environment.apiBaseUrl}cars`;
  private isBrowser: boolean;
  private popularCarsCache$: Observable<CarBriefInfoResponse> | null = null;
  private carsCache: Map<string, {
    response$: Observable<CarBriefInfoResponse>,
    timestamp: number
  }> = new Map();
  // Cache configuration
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 20; // Maximum number of different param combinations to cache

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getPopularCars(): Observable<CarBriefInfoResponse> {
    if (!this.popularCarsCache$) {
      this.popularCarsCache$ = this.http.get<CarBriefInfoResponse>(`${this.apiUrl}/popular`).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Popular Cars Error:', error);
          this.popularCarsCache$ = null;
          return throwError(() => error);
        })
      );
    }
    return this.popularCarsCache$;
  }

  getCars(params: string): Observable<CarBriefInfoResponse> {
    const now = Date.now();
    const cached = this.carsCache.get(params);
    
    // Return cached response if it exists and hasn't expired
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.response$;
    }
    
    // Remove expired cache entry if exists
    if (cached) {
      this.carsCache.delete(params);
    }
    
    // Manage cache size - remove oldest entries if needed
    if (this.carsCache.size >= this.MAX_CACHE_SIZE) {
      // Find and delete the oldest entry
      let oldestKey = '';
      let oldestTime = Infinity;
      
      this.carsCache.forEach((value, key) => {
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          oldestKey = key;
        }
      });
      
      if (oldestKey) {
        this.carsCache.delete(oldestKey);
      }
    }
    
    // Create new Observable and add to cache
    const response$ = this.http.get<CarBriefInfoResponse>(`${this.apiUrl}?${params}`).pipe(
      shareReplay(1),
      catchError(error => {
        console.error('Cars Error:', error);
        this.carsCache.delete(params);
        return throwError(() => error);
      })
    );
    
    this.carsCache.set(params, { response$, timestamp: now });
    return response$;
  }

  getCarDetails(carId: string): Observable<CarDetailsResponseBody> {
    return this.http.get<CarDetailsResponseBody>(`${this.apiUrl}/${carId}`).pipe(
      catchError(error => {
        console.error('Error fetching car details', error);
        return throwError(() => error);
      })
    );
  }
  getCarBookedDays(carId: string): Observable<CarBookedDaysResponseBody> {
    return this.http.get<CarBookedDaysResponseBody>(`${this.apiUrl}/${carId}/booked-days`).pipe(
      catchError(error => {
        console.error('Error fetching booked dates', error);
        return throwError(() => error);
      })
    );
  }


  
  

  clearPopularCarsCache(): void {
    this.popularCarsCache$ = null;
  }
  clearCarsCache(params?: string): void {
    if (params) {
      this.carsCache.delete(params);
    } else {
      this.carsCache.clear();
    }
  }
  clearAllCaches(): void {
    this.popularCarsCache$ = null;
    this.carsCache.clear();
  }
}