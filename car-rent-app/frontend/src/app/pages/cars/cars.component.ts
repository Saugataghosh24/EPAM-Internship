import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from "../../shared/footer/footer.component";
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CarService } from '../../services/car-brief-info.service';
import { ButtonComponent } from "../../shared/button/button.component";
import { CarCardComponent } from "../../components/car-card/car-card.component";
import { CarSearchComponent } from "../../components/car-search/car-search.component";
import { ActiveButtonService } from '../../services/active-button.service';
import { ActivatedRoute } from '@angular/router';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { CarDetailsModalComponent } from "../../components/car-details-modal/car-details-modal.component";
import { SearchFilterService } from '../../services/filter.service';

@Component({
  selector: 'app-cars',
  imports: [HeaderComponent, FooterComponent, CommonModule, CarCardComponent, CarSearchComponent, CarDetailsModalComponent],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarListComponent implements OnInit {
  @ViewChild(CarSearchComponent) carSearchComponent?: CarSearchComponent;

  cars: CarDetailsResponseBody[] = [];
  filteredCars: CarDetailsResponseBody[] = [];
  availableCars: CarDetailsResponseBody[] = [];
  bookedCars: CarDetailsResponseBody[] = [];
  unavailableCars: CarDetailsResponseBody[] = [];
  currentPage = 1;
  itemsPerPage = 8;
  loading = true;
  error = false;
  isFiltered = false;

  showDetailsModal = false;
  selectedCar: CarDetailsResponseBody | null = null;

  constructor(private carService: CarService,
    private searchFilterService: SearchFilterService,

    private activeButtonService: ActiveButtonService,
    private route: ActivatedRoute
  ) {}


 
  ngOnInit(): void {
    this.loadCars();
    this.activeButtonService.setActiveButton('Cars');
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'top') {
        window.scrollTo(0, 0);
      }
    });
    
    // Check if we're coming from the home page with filters
    if (this.searchFilterService.hasActiveFilters() && this.searchFilterService.hasSearched()) {
      // If we have active filters and a search has been performed,
      // we'll let the CarSearchComponent handle it via applyStoredFilters()
      this.isFiltered = true;
    }
  }

  loadCars(): void {
    this.loading = true;
    this.error = false;
    
    this.carService.getCars().subscribe({
      next: (cars) => {
        if (cars && Array.isArray(cars)) {
          this.cars = [...cars]; // Create a new array to ensure change detection
          this.filteredCars = [...cars]; // Initialize filtered cars with all cars
          
          // Log image URLs for debugging
          if (cars && Array.isArray(cars)) {
            cars.forEach(car => {
              console.log(`Car ${car.model} image URL: ${car.images[0]}`);
            });
          }
          
          this.categorizeCarsByStatus();
          this.loading = false;
          
          // Note: We don't apply filters here anymore since the CarSearchComponent 
          // will handle it via applyStoredFilters() if there are active filters
        } else {
          console.error('Received invalid cars data:', cars);
          this.cars = [];
          this.filteredCars = [];
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error in component:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  // Handle search results from CarSearchComponent
  onSearchResults(results: CarDetailsResponseBody[]): void {
    // Always set filtered cars to the results
    this.filteredCars = [...results];
    
    // If we have results
    if (results.length > 0) {
      // Check if this is a reset (all cars returned after clearing filters)
      const isReset = results.length === this.cars.length && 
        results.every(car => this.cars.some(c => c.carId === car.carId));
      
      if (isReset) {
        // If it's a reset, mark as not filtered
        this.isFiltered = false;
      } else {
        // Otherwise, it's a filtered result
        this.isFiltered = true;
      }
    } else {
      // If no results and we've searched, keep isFiltered true to show "no results" message
      if (this.searchFilterService.hasSearched()) {
        this.isFiltered = true;
      } else {
        // Otherwise, not filtered
        this.isFiltered = false;
      }
    }
    
    this.currentPage = 1; // Reset to first page
    this.categorizeCarsByStatus();
  }

  onSearchInProgress(isLoading: boolean): void {
    this.loading = isLoading;
  }
  
  onSearchError(errorMessage: string | null): void {
    if (errorMessage) {
      this.error = true;
    } else {
      this.error = false;
    }
  }
 
  resetFilters(): void {
    // Reset to original cars list
    this.filteredCars = [...this.cars];
    this.isFiltered = false;
    this.currentPage = 1;
    this.categorizeCarsByStatus();
    
    // Also trigger the car search component to reset its form
    if (this.carSearchComponent) {
      this.carSearchComponent.clearFilters();
    }
  }
  categorizeCarsByStatus(): void {
    // Use filtered cars instead of all cars
    const carsToUse = this.isFiltered ? this.filteredCars : this.cars;
    
    this.availableCars = carsToUse.filter(car => car.status === 'AVAILABLE');
    this.bookedCars = carsToUse.filter(car => car.status === 'BOOKED');
    this.unavailableCars = carsToUse.filter(car => car.status === 'UNAVAILABLE');
    
    // Combine in the required order
    this.filteredCars = [...this.availableCars, ...this.bookedCars, ...this.unavailableCars];
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredCars.length / this.itemsPerPage);
  }

  get visiblePageNumbers(): number[] {
    const pages: number[] = [];
    
    if (this.totalPages <= 5) {
      // If 5 or fewer pages, show all page numbers
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // If more than 5 pages, show a window around the current page
      let start = Math.max(1, this.currentPage - 1);
      let end = Math.min(this.totalPages, start + 2);
      
      // Adjust start if end is at the maximum
      if (end === this.totalPages) {
        start = Math.max(1, end - 2);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get paginatedCars(): CarDetailsResponseBody[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const result = this.filteredCars.slice(startIndex, endIndex);
    return result;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'available': return 'text-green-500';
      case 'booked': return 'text-amber-500';
      case 'unavailable': return 'text-red-500';
      default: return '';
    }
  }

  // Add trackBy function for better performance
  trackByCar(index: number, car: CarDetailsResponseBody): string {
    return car.carId;
  }
  
  onBookCar(carId: string): void {
    console.log(`Opening booking modal for car with ID: ${carId}`);
    this.loadCarDetails(carId);
  }

  onViewDetails(carId: string): void {
    console.log(`Opening details modal for car with ID: ${carId}`);
    this.loadCarDetails(carId);
  }
  
  loadCarDetails(carId: string): void {
    this.carService.getCarDetails(carId).subscribe({
      next: (carDetails) => {
        console.log()
        this.selectedCar = carDetails;
        this.showDetailsModal = true;
        // this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading car details:', err);
        // Show error message to user
      }
    });
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedCar = null;
  }
  
  bookSelectedCar(carId: string): void {
    console.log(`Booking car with ID: ${carId}`);
    // Implement actual booking logic
    // This could navigate to a booking page or show another modal
    
    // For now, just close the modal
    this.closeDetailsModal();
  }
}