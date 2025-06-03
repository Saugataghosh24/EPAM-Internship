// src/app/services/location-info.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LocationInfo } from '../models/LocationInfo.model';
import { CarDetailsResponseBody } from '../models/CarDetails.models';

@Injectable({
  providedIn: 'root'
})
export class LocationInfoService {
  private baseUrl = 'http://localhost:3000/LocationInfo';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getLocationInfo(): Observable<LocationInfo[]> {
    // If we're on the server, return empty array to prevent server-side HTTP requests
    if (!this.isBrowser) {
      return of([]);
    }
    
    return this.http.get<LocationInfo[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error fetching locations:', error);
        return of([]);
      })
    );
  }
  
  // Extract unique locations from cars
  getLocationsFromCars(cars: CarDetailsResponseBody[]): string[] {
    if (!cars || cars.length === 0) {
      return [];
    }
    
    // Extract locations and remove duplicates
    const locations = cars
      .map(car => car.location)
      .filter((location, index, self) => 
        location && self.indexOf(location) === index
      );
      
    return locations;
  }
}