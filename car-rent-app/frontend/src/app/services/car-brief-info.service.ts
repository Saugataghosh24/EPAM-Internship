// src/app/services/car.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CarBriefInfo } from '../models/CarBriefInfo.model';
import { CarDetailsResponseBody } from '../models/CarDetails.models';
import { CarFilterOptions } from '../models/CarFilter.models';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:3000/CarDetails';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getCars(): Observable<CarDetailsResponseBody[]> {
    // If we're on the server, return empty array to prevent server-side HTTP requests
    if (!this.isBrowser) {
      return of([]);
    }
    
    return this.http.get<CarDetailsResponseBody[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching cars:', error);
        return of([]);
      })
    );
  }

  // New method for searching cars with filters
  searchCars(filters: CarFilterOptions): Observable<CarDetailsResponseBody[]> {
    // If we're on the server, return empty array to prevent server-side HTTP requests
    if (!this.isBrowser) {
      return of([]);
    }
    
    // Get all cars and then filter them
    return this.getCars().pipe(
      map(cars => this.applyFilters(cars, filters)),
      catchError(error => {
        console.error('Error searching cars:', error);
        return of([]);
      })
    );
  }

  // Method to apply filters to the cars
  private applyFilters(cars: CarDetailsResponseBody[], filters: CarFilterOptions): CarDetailsResponseBody[] {
    return cars.filter(car => {
      // Filter by location if provided
      if (filters.pickupLocation && car.location !== filters.pickupLocation) {
        return false;
      }
      
      // Filter by fuel type if not 'ANY'
      if (filters.fuelType && filters.fuelType !== 'ANY' && car.fuelType !== filters.fuelType) {
        return false;
      }
      
      // Filter by gearbox type if not 'ANY'
      if (filters.gearboxType && filters.gearboxType !== 'ANY' && car.gearBoxType !== filters.gearboxType) {
        return false;
      }
      
      // Filter by category if not 'ANY'
      if (filters.category && filters.category !== 'ANY' && car.carCategory !== filters.category) {
        return false;
      }
      
      // Filter by price range if provided
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        const carPrice = parseFloat(car.pricePerDay);
        if (carPrice < filters.minPrice || carPrice > filters.maxPrice) {
          return false;
        }
      }
      
      // If all filters pass, include the car
      return true;
    });
  }

  getCarDetails(carId: string): Observable<CarDetailsResponseBody> {
    // If we're on the server, return mock data to prevent server-side HTTP requests
    if (!this.isBrowser) {
      return of(this.getMockCarDetails(carId));
    }
    
    // For JSON Server, we need to get the specific car by ID
    return this.http.get<any>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          // Check if response is an array (direct array response) or if it has a UserBookingInfo property
          const userBookingsArray = Array.isArray(response) ? response : response.UserBookingInfo;
          
          if (!userBookingsArray) {
            console.error('Unexpected response structure:', response);
            return undefined;
          }
          
          // Find the car with the matching carId
          return response.find((CarDetails: CarDetailsResponseBody) => CarDetails.carId === carId);
        }),
        catchError(error => {
          console.error('Error in getCarDetails:', error);
          return of(this.getMockCarDetails(carId));
        })
      );
  }
  
  // Helper method to normalize car data
  private normalizeCarData(car: any): CarBriefInfo {
    // Ensure we have either images array or imageUrl
    if (!car.images && !car.imageUrl) {
      car.imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDBkRXExdMYLo4DhjVnGByS7NlXl479tOH8A&s';
    }
    
    // If we have imageUrl but no images array, create an images array
    if (car.imageUrl && (!car.images || car.images.length === 0)) {
      car.images = [car.imageUrl];
    }
    
    // If we have images array but no imageUrl, set imageUrl to first image
    if (car.images && car.images.length > 0 && !car.imageUrl) {
      car.imageUrl = car.images[0];
    }
    
    return car;
  }
  
  // Helper method to normalize car details data
  private normalizeCarDetailsData(car: CarDetailsResponseBody): CarDetailsResponseBody {
    // Ensure car.images is an array
    if (!car.images || !Array.isArray(car.images) || car.images.length === 0) {
      // Try to use imageUrl if it exists (from any source)
      const imageUrl = (car as any).imageUrl || 'assets/images/placeholder-car.jpg';
      car.images = [imageUrl];
    }
    
    return car;
  }
  
  private getMockCarDetails(carId: string): CarDetailsResponseBody {
    // Create a detailed version with mock data
    return {
      carId: carId,
      model: 'Audi A6 Quattro 2023',
      location: 'Los Angeles, CA',
      pricePerDay: '180',
      carRating: '4.8',
      carCategory: "ECONOMY",
      serviceRating: '4.7',
      status: 'AVAILABLE',
      engineCapacity: '3.0 turbo (340 h.p.)',
      fuelConsumption: '10.5 l / 100 km',
      fuelType: 'PETROL',
      gearBoxType: 'AUTOMATIC',
      climateControlOption: 'CLIMATE_CONTROL',
      passengerCapacity: '5',
      images: [
        'assets/images/audi-a6-1.jpg',
        'assets/images/audi-a6-2.jpg',
        'assets/images/audi-a6-3.jpg',
        'assets/images/audi-a6-4.jpg',
        'assets/images/audi-a6-5.jpg'
      ]
    };
  }
}