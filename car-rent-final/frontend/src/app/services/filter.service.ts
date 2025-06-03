// src/app/services/search-filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CarFilterOptions } from '../models/CarFilter.models';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  // Default empty filter
  private defaultFilter: CarFilterOptions = {
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    fuelType: 'ANY',
    gearboxType: 'ANY',
    category: 'ANY',
    minPrice: 0,
    maxPrice: 1000
  };

  // BehaviorSubject to store the current filter
  private activeFiltersSubject = new BehaviorSubject<CarFilterOptions>(this.defaultFilter);
  activeFilters$ = this.activeFiltersSubject.asObservable();
  
  // Flag to indicate if filters have been set
  private hasActiveFiltersSubject = new BehaviorSubject<boolean>(false);
  hasActiveFilters$ = this.hasActiveFiltersSubject.asObservable();
  
  // Flag to indicate if a search has been performed
  private hasSearchedSubject = new BehaviorSubject<boolean>(false);
  hasSearched$ = this.hasSearchedSubject.asObservable();

  constructor() { }

  // Set new filters
  setFilters(filters: CarFilterOptions): void {
    this.activeFiltersSubject.next(filters);
    this.hasActiveFiltersSubject.next(true);
    this.hasSearchedSubject.next(true);
  }

  // Get current filters
  getFilters(): CarFilterOptions {
    return this.activeFiltersSubject.value;
  }

  // Clear filters
  clearFilters(): void {
    this.activeFiltersSubject.next(this.defaultFilter);
    this.hasActiveFiltersSubject.next(false);
    this.hasSearchedSubject.next(false);
  }

  // Check if filters have been set
  hasActiveFilters(): boolean {
    return this.hasActiveFiltersSubject.value;
  }
  
  // Check if a search has been performed
  hasSearched(): boolean {
    return this.hasSearchedSubject.value;
  }
  
  // Mark that a search has been performed
  markSearched(): void {
    this.hasSearchedSubject.next(true);
  }
}