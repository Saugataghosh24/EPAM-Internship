// src/app/components/car-search/car-search.component.ts
import { Component, OnInit, ElementRef, ViewChild, HostListener, PLATFORM_ID, Inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { LocationInfoService } from '../../services/location-info.service';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { LocationInfo } from '../../models/LocationInfo.model';
import { CarFilterOptions, CategoryOption, FuelType, GearBoxType } from '../../models/CarFilter.models';
import { DateTimePickerComponent } from '../../shared/date-time-picker/date-time-picker.component';
import { SearchFilterService } from '../../services/filter.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-search',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,DateTimePickerComponent],
  templateUrl: "car-search.component.html",
})
export class CarSearchComponent implements OnInit {
  searchForm: FormGroup;
  locations: LocationInfo[] = [];
  carCategories: CategoryOption[] = ['ECONOMY' , 'PREMIUM' , 'CROSSOVER' , 'COMFORT', 'BUSINESS', 'MINIVAN', 'ELECTRIC' ,'ANY'];
  gearboxTypes: GearBoxType[] = ['MANUAL', 'AUTOMATIC', 'ANY'];
  fuelTypes: FuelType[] = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'ANY'];
  minPrice: number = 0;
  maxPrice: number = 1000;
  priceRange = {
    min: 100,
    max: 800
  };
  isDragging: boolean = false;
  currentHandle: 'min' | 'max' | null = null;
  sliderTrackElement: ElementRef | null = null;
  isMobile: boolean = false;
  isLoading: boolean = false;
  isLoadingLocations: boolean = false;
  hasSearched: boolean = false;
  errorMessage: string | null = null;
  // Flag to check if code is running in browser
  isBrowser: boolean = false;
  noResults: boolean = false;
  //time
  dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(new Date().setMinutes(new Date().getMinutes()+30)),
    dropoff: new Date(new Date(new Date().setMinutes(new Date().getMinutes()+330)).setDate(new Date().getDate() + 5))
  };
  @Output() pickerOpen = new EventEmitter<boolean>();
  isDatePickerActive = false; // Add this property to your component

openPickup() {
  this.isDatePickerActive = true;
  this.pickerOpen.emit(true);
  this.isPickupVisible = this.isPickupVisible === true ? false : true;
}
  isPickupVisible=false;
  alreadybooked=false;
  selectedDates(dates:{pickup: Date, dropoff: Date}){
    // Prevent any form submission
    event?.preventDefault?.();
    event?.stopPropagation?.();
    
    const pickup = dates.pickup;
    const dropoff = dates.dropoff;
    this.dateTime = {pickup, dropoff};
  }
  pickerStatus(open: boolean) {
  this.isPickupVisible = open;
  // Reset active status when picker is closed
  if (!open) {
    setTimeout(() => {
      this.isDatePickerActive = false;
    }, 100);
  }
}

  constructor(
    private elementRef: ElementRef,
    private formBuilder: FormBuilder,
    private locationService: LocationInfoService,
    private searchFilterService: SearchFilterService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check if we're in the browser
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.searchForm = this.formBuilder.group({
      pickupLocation: ['', Validators.required],
      dropoffLocation: ['', Validators.required],
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
    
    }
    

// In the searchCars method:
searchCars(event?: Event): void {
  // If date picker is active, prevent submission
  if (this.isDatePickerActive || this.isPickupVisible) {
    event?.preventDefault();
    event?.stopPropagation();
    return;
  }
  // If the event exists and it's from the date picker, prevent form submission
  if (event) {
    const target = event.target as HTMLElement;
    if (target.closest('app-date-time-picker')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }
  if (this.searchForm.invalid) {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.searchForm.controls).forEach(key => {
      const control = this.searchForm.get(key);
      control?.markAsTouched();
    });
    return;
  }
  this.router.navigate(['/cars']);
  // Create filter options from form values and price range
  const filterOptions: CarFilterOptions = {
    pickupLocation: this.searchForm.value.pickupLocation,
    dropoffLocation: this.searchForm.value.dropoffLocation,
    pickupDate: this.dateTime.pickup.toISOString().slice(0, 19),
    dropoffDate: this.dateTime.dropoff.toISOString().slice(0, 19),
    fuelType: this.searchForm.value.fuelType,
    gearboxType: this.searchForm.value.gearboxType,
    category: this.searchForm.value.carCategory,
    minPrice: this.priceRange.min,
    maxPrice: this.priceRange.max
  };
  // Store filters in the shared service
  this.searchFilterService.setFilters(filterOptions);
  // Otherwise, perform the search on the cars page
  this.errorMessage = null;
  this.hasSearched = true;
}

  
clearFilters(): void {
  // Reset form to default values
  this.searchForm.reset({
    pickupLocation: '',
    dropoffLocation: '',
    carCategory: 'ANY',
    gearboxType: 'ANY',
    fuelType: 'ANY'
  });
  // Reset price range
  this.priceRange = {
    min: 100,
    max: 800
  };
  // Clear search results
  this.hasSearched = false;
  this.errorMessage = null;
  // Clear filters in the service
  this.searchFilterService.clearFilters();
  
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
      if (locationInfos && locationInfos.content.length > 0) {
        this.locations = locationInfos.content;
      }
    },
    error: (error) => {
      console.error('Error loading locations from service:', error);
    }
  });
}


ngOnDestroy(): void {
  // Only remove event listeners if in browser
  if (this.isBrowser) {
    // Clean up resize listener
    window.removeEventListener('resize', this.onResize.bind(this));
  }
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
    
    event.preventDefault(); // Prevent page 
  }
  
}