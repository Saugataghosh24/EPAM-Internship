// src/app/components/car-search/car-search.component.ts
import { Component, OnInit, ElementRef, ViewChild, HostListener, PLATFORM_ID, Inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { LocationInfoService } from '../../services/location-info.service';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { LocationInfo } from '../../models/LocationInfo.model';
import { CarFilterOptions, CategoryOption, FuelType, GearBoxType } from '../../models/CarFilter.models';
import { CarService } from '../../services/car-brief-info.service';
import { DateTimePickerComponent } from '../../shared/date-time-picker/date-time-picker.component';
import { SearchFilterService } from '../../services/filter.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-search',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,DateTimePickerComponent],
  templateUrl: "car-search.component.html",
})
export class CarSearchComponent implements OnInit {
  @Output() searchResults = new EventEmitter<CarDetailsResponseBody[]>();
  @Output() searchInProgress = new EventEmitter<boolean>();
  @Output() searchError = new EventEmitter<string | null>();
   // Input to determine if this is on the home page or cars page
   @Input() isHomePage: boolean = false;
  searchForm: FormGroup;
  locations: string[] = [];
  locationInfos: LocationInfo[] = [];
  dates: string[] = ['October 28', 'October 29', 'October 30', 'October 31', 'November 1'];
  
  // Car categories to match the required types
  carCategories: CategoryOption[] = ['PASSENGER','SUV', 'LUXURY', 'ECONOMY', 'ANY'];
  
  // Gearbox types to match the required types
  gearboxTypes: GearBoxType[] = ['MANUAL', 'AUTOMATIC', 'ANY'];
  
  // Fuel types to match the required types
  fuelTypes: FuelType[] = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'ANY'];
  
  // Display names for enum values
  fuelTypeDisplayNames: Record<FuelType, string> = {
    'PETROL': 'Petrol',
    'DIESEL': 'Diesel',
    'ELECTRIC': 'Electric',
    'HYBRID': 'Hybrid',
    'ANY': 'Any'
  };
  
  gearboxTypeDisplayNames: Record<GearBoxType, string> = {
    'MANUAL': 'Manual',
    'AUTOMATIC': 'Automatic',
    'ANY': 'Any'
  };
  
  minPrice: number = 0;
  maxPrice: number = 500;
  priceRange = {
    min: 0,
    max: 500
  };
  
  isDragging: boolean = false;
  currentHandle: 'min' | 'max' | null = null;
  sliderTrackElement: ElementRef | null = null;
  isMobile: boolean = false;
  
  isLoading: boolean = false;
  isLoadingLocations: boolean = false;
  hasSearched: boolean = false;
  errorMessage: string | null = null;
  
  // Search results
  // searchResults: CarDetailsResponseBody[] = [];
  
  // Flag to check if code is running in browser
  isBrowser: boolean = false;
  noResults: boolean = false;

  pickupError=true;
    dropoffError=true;
    pickupDisplay = '';
    dropoffDisplay = '';
    showPicker = false;
    pickupDate='';
    dropoffDate='';
    togglePicker(){
      this.showPicker = this.showPicker===false? true:false;
    }
    onDateSelected(event: { pickup: Date; dropoff: Date }) {
      this.pickupError=false;
      this.dropoffError=false;
      this.pickupDate=event.pickup.toLocaleDateString();
      this.dropoffDate=event.dropoff.toLocaleDateString();
      this.searchForm.value.pickUpDate=this.pickupDate;
      this.searchForm.value.dropoffDate=this.dropoffDate;
      this.pickupDisplay = this.formatDate(event.pickup);
      this.dropoffDisplay = this.formatDate(event.dropoff);
    }
    formatDate(date: Date): string {
      const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
   
    
    constructor(
      private elementRef: ElementRef,
      private formBuilder: FormBuilder,
      private locationService: LocationInfoService,
      private carService: CarService,
      private searchFilterService: SearchFilterService,
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: Object
    ) {
      // Check if we're in the browser
      this.isBrowser = isPlatformBrowser(this.platformId);
      
      this.searchForm = this.formBuilder.group({
        pickupLocation: ['', Validators.required],
        dropoffLocation: ['', Validators.required],
        pickupDate: ['April 28', Validators.required],
        dropoffDate: ['April 29', Validators.required],
        carCategory: ['ANY'],
        gearboxType: ['ANY'],
        fuelType: ['ANY']
      });
    }
    
    ngOnInit(): void {
      // Load locations from the service
      this.loadLocations();
      
      // Only check for mobile and add event listeners if in browser
      if (this.isBrowser) {
        this.checkIfMobile();
        // Add window resize listener to update mobile status
        window.addEventListener('resize', this.onResize.bind(this));
      }
      
      // If on the cars page and we have active filters, apply them
      if (!this.isHomePage && this.searchFilterService.hasActiveFilters()) {
        this.applyStoredFilters();
      }
    }
    

// In the searchCars method:
searchCars(): void {
  if (this.searchForm.invalid) {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.searchForm.controls).forEach(key => {
      const control = this.searchForm.get(key);
      control?.markAsTouched();
    });
    return;
  }
  
  // Create filter options from form values and price range
  const filterOptions: CarFilterOptions = {
    pickupLocation: this.searchForm.value.pickupLocation,
    dropoffLocation: this.searchForm.value.dropoffLocation,
    pickupDate: this.searchForm.value.pickupDate,
    dropoffDate: this.searchForm.value.dropoffDate,
    fuelType: this.searchForm.value.fuelType,
    gearboxType: this.searchForm.value.gearboxType,
    category: this.searchForm.value.carCategory,
    minPrice: this.priceRange.min,
    maxPrice: this.priceRange.max
  };
  
  // Store filters in the shared service
  this.searchFilterService.setFilters(filterOptions);
  
  // If on home page, navigate to cars page
  if (this.isHomePage) {
    this.router.navigate(['/cars']);
    return;
  }
  
  // Otherwise, perform the search on the cars page
  this.isLoading = true;
  this.errorMessage = null;
  this.hasSearched = true;
  
  // Emit loading state to parent component
  this.searchInProgress.emit(true);
  this.searchError.emit(null);
  
  console.log('Searching with filters:', filterOptions);
  
  this.carService.searchCars(filterOptions)
  .pipe(
    finalize(() => {
      this.isLoading = false;
      this.searchInProgress.emit(false);
    })
  )
  .subscribe({
    next: (cars) => {
      console.log('Found cars:', cars);
      // Set noResults flag
      this.noResults = cars.length === 0;
      // Mark that a search has been performed, even if no results
      this.searchFilterService.markSearched();
      // Emit results to parent component
      this.searchResults.emit(cars);
    },
    error: (error) => {
      console.error('Error searching cars:', error);
      this.errorMessage = 'Failed to search for cars. Please try again later.';
      this.searchError.emit(this.errorMessage);
    }
  });
}

// Update the applyStoredFilters method to handle empty results
applyStoredFilters(): void {
  const filters = this.searchFilterService.getFilters();
  
  // Update the form with stored values
  this.searchForm.patchValue({
    pickupLocation: filters.pickupLocation || '',
    dropoffLocation: filters.dropoffLocation || '',
    pickupDate: filters.pickupDate || 'October 29',
    dropoffDate: filters.dropoffDate || 'October 31',
    carCategory: filters.category || 'ANY',
    gearboxType: filters.gearboxType || 'ANY',
    fuelType: filters.fuelType || 'ANY'
  });
  
  // Update price range if available
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    this.priceRange.min = filters.minPrice;
    this.priceRange.max = filters.maxPrice;
  }
  
  // Set hasSearched flag
  this.hasSearched = this.searchFilterService.hasSearched();
  
  // Auto-search with these filters
  setTimeout(() => {
    this.searchCars();
  }, 0);
}
  
  ngOnDestroy(): void {
    // Only remove event listeners if in browser
    if (this.isBrowser) {
      // Clean up resize listener
      window.removeEventListener('resize', this.onResize.bind(this));
    }
  }
  
  loadLocations(): void {
    this.isLoadingLocations = true;
    
    // First try to get locations from the location service
    this.locationService.getLocationInfo()
      .pipe(
        finalize(() => {
          this.isLoadingLocations = false;
        })
      )
      .subscribe({
        next: (locationInfos) => {
          if (locationInfos && locationInfos.length > 0) {
            this.locationInfos = locationInfos;
            // Extract location names for the dropdown
            this.locations = locationInfos.map(location => location.locationName);
          } else {
            // If no locations from the service, get them from cars
            this.loadLocationsFromCars();
          }
        },
        error: (error) => {
          console.error('Error loading locations from service:', error);
          // Fallback to getting locations from cars
          this.loadLocationsFromCars();
        }
      });
  }
  
  loadLocationsFromCars(): void {
    this.isLoadingLocations = true;
    this.carService.getCars()
      .pipe(
        finalize(() => {
          this.isLoadingLocations = false;
        })
      )
      .subscribe({
        next: (cars) => {
          // Extract unique locations from cars
          this.locations = this.locationService.getLocationsFromCars(cars);
        },
        error: (error) => {
          console.error('Error loading locations from cars:', error);
          this.errorMessage = 'Failed to load locations. Please try again later.';
        }
      });
  }
  
  onResize(): void {
    if (this.isBrowser) {
      this.checkIfMobile();
    }
  }
  
  checkIfMobile(): void {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth < 640; // 640px is Tailwind's sm breakpoint
    }
  }
  
  // Price slider methods
  startDrag(event: MouseEvent, handle: 'min' | 'max'): void {
    event.preventDefault();
    this.isDragging = true;
    this.currentHandle = handle;
    
    // Store the slider track element for future calculations
    const target = event.target as HTMLElement;
    const trackElement = target.closest('.price-slider');
    if (trackElement) {
      this.sliderTrackElement = new ElementRef(trackElement);
      this.updateSliderPosition(event);
    }
  }
  
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isBrowser) return;
    
    if (this.isDragging && this.currentHandle) {
      this.updateSliderPosition(event);
    }
  }
  
  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (!this.isBrowser) return;
    
    this.isDragging = false;
    this.currentHandle = null;
  }
  
  updateSliderPosition(event: MouseEvent): void {
    if (!this.isDragging || !this.currentHandle || !this.sliderTrackElement) return;
    
    const trackRect = this.sliderTrackElement.nativeElement.getBoundingClientRect();
    
    // Calculate position percentage (clamped between 0 and 1)
    let position = (event.clientX - trackRect.left) / trackRect.width;
    position = Math.max(0, Math.min(1, position)); // Clamp between 0 and 1
    
    // Calculate the value based on position
    const value = Math.round(this.minPrice + position * (this.maxPrice - this.minPrice));
    
    // Update the appropriate handle with constraints
    if (this.currentHandle === 'min') {
      // Ensure min doesn't exceed max - 10 (for a minimum gap)
      this.priceRange.min = Math.min(value, this.priceRange.max - 10);
      // Also ensure min doesn't go below minPrice
      this.priceRange.min = Math.max(this.minPrice, this.priceRange.min);
    } else {
      // Ensure max doesn't go below min + 10 (for a minimum gap)
      this.priceRange.max = Math.max(value, this.priceRange.min + 10);
      // Also ensure max doesn't exceed maxPrice
      this.priceRange.max = Math.min(this.maxPrice, this.priceRange.max);
    }
  }
  
  // Handle touch events - critical for mobile devices
  startDragTouch(event: TouchEvent, handle: 'min' | 'max'): void {
    event.preventDefault();
    this.isDragging = true;
    this.currentHandle = handle;
    
    const target = event.target as HTMLElement;
    const trackElement = target.closest('.price-slider');
    if (trackElement && event.touches.length > 0) {
      this.sliderTrackElement = new ElementRef(trackElement);
      this.updateSliderPositionTouch(event.touches[0]);
    }
  }
  
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isBrowser) return;
    
    if (this.isDragging && this.currentHandle && event.touches.length > 0) {
      event.preventDefault(); // Prevent page scrolling while dragging
      this.updateSliderPositionTouch(event.touches[0]);
    }
  }
  
  @HostListener('touchend')
  onTouchEnd(): void {
    if (!this.isBrowser) return;
    
    this.isDragging = false;
    this.currentHandle = null;
  }
  
  updateSliderPositionTouch(touch: Touch): void {
    if (!this.isDragging || !this.currentHandle || !this.sliderTrackElement) return;
    
    const trackRect = this.sliderTrackElement.nativeElement.getBoundingClientRect();
    
    // Calculate position percentage (clamped between 0 and 1)
    let position = (touch.clientX - trackRect.left) / trackRect.width;
    position = Math.max(0, Math.min(1, position)); // Clamp between 0 and 1
    
    // Calculate the value based on position
    const value = Math.round(this.minPrice + position * (this.maxPrice - this.minPrice));
    
    // Update the appropriate handle with constraints
    if (this.currentHandle === 'min') {
      // Ensure min doesn't exceed max - 10 (for a minimum gap)
      this.priceRange.min = Math.min(value, this.priceRange.max - 10);
      // Also ensure min doesn't go below minPrice
      this.priceRange.min = Math.max(this.minPrice, this.priceRange.min);
    } else {
      // Ensure max doesn't go below min + 10 (for a minimum gap)
      this.priceRange.max = Math.max(value, this.priceRange.min + 10);
      // Also ensure max doesn't exceed maxPrice
      this.priceRange.max = Math.min(this.maxPrice, this.priceRange.max);
    }
  }
  
  // Keyboard navigation
  onKeyDown(event: KeyboardEvent, handle: 'min' | 'max'): void {
    const step = this.isMobile ? 10 : 5; // Larger steps on mobile for easier control
    
    if (handle === 'min') {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        // Ensure min doesn't exceed max - 10
        this.priceRange.min = Math.min(this.priceRange.min + step, this.priceRange.max - 10);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        // Ensure min doesn't go below minPrice
        this.priceRange.min = Math.max(this.priceRange.min - step, this.minPrice);
      }
    } else {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        // Ensure max doesn't exceed maxPrice
        this.priceRange.max = Math.min(this.priceRange.max + step, this.maxPrice);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        // Ensure max doesn't go below min + 10
        this.priceRange.max = Math.max(this.priceRange.max - step, this.priceRange.min + 10);
      }
    }
    
    event.preventDefault(); // Prevent page scrolling
  }
  

  
  clearFilters(): void {
    // Reset form to default values
    this.searchForm.reset({
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: 'April 28',
      dropoffDate: 'April 29',
      carCategory: 'ANY',
      gearboxType: 'ANY',
      fuelType: 'ANY'
    });
    
    // Reset price range
    this.priceRange = {
      min: this.minPrice,
      max: this.maxPrice
    };
    
    // Clear search results
    this.hasSearched = false;
    this.errorMessage = null;
    
    // Clear filters in the service
    this.searchFilterService.clearFilters();
    
    // If on cars page, get all cars
    if (!this.isHomePage) {
      this.isLoading = true;
      this.searchInProgress.emit(true);
      
      this.carService.getCars()
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.searchInProgress.emit(false);
          })
        )
        .subscribe({
          next: (cars) => {
            // Emit all cars to reset the view
            this.searchResults.emit(cars);
            this.searchError.emit(null);
          },
          error: (error) => {
            console.error('Error loading all cars:', error);
            this.errorMessage = 'Failed to load cars. Please try again later.';
            this.searchError.emit(this.errorMessage);
          }
        });
    }
  }
  // Helper method to get display name for fuel type
  getFuelTypeDisplay(type: string): string {
    return this.fuelTypeDisplayNames[type as FuelType] || type;
  }
  
  getGearboxTypeDisplay(type: string): string {
    return this.gearboxTypeDisplayNames[type as GearBoxType] || type;
  }
}