import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarService } from '../../services/car.service';
import { CarCardComponent } from "../../components/car-card/car-card.component";
import { ActiveButtonService } from '../../services/active-button.service';
import { ActivatedRoute } from '@angular/router';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { CarDetailsModalComponent } from "../../components/car-details-modal/car-details-modal.component";
import { SearchFilterService } from '../../services/filter.service';
import { CarBriefInfo } from '../../models/CarBriefInfo.model';
import { Subscription } from 'rxjs';
import { CarFilterOptions } from '../../models/CarFilter.models';

@Component({
  selector: 'app-cars',
  imports: [ CommonModule, CarCardComponent, CarDetailsModalComponent],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarListComponent implements OnInit ,OnDestroy{
  cars: CarBriefInfo[] = [];
  filteredCars: CarBriefInfo[] = [];
  availableCars: CarDetailsResponseBody[] = [];
  bookedCars: CarDetailsResponseBody[] = [];
  unavailableCars: CarDetailsResponseBody[] = [];
  currentPage = 1;
  totalPages=0;
  itemsPerPage = 16;
  loading = true;
  error = false;
  isFiltered = false;
  detailsLoading = false;

  showDetailsModal = false;
  selectedCarId: string = '';
  constructor(private carService: CarService,
    private searchFilterService: SearchFilterService,

    private activeButtonService: ActiveButtonService,
    private route: ActivatedRoute
  ) {}
  private subscription: Subscription = new Subscription;

  filter!: CarFilterOptions;
  ngOnInit(): void {
    this.filter = this.searchFilterService.getFilters();
    this.subscription = this.searchFilterService.activeFilters$.subscribe((filters) => {
      this.currentPage=1;
      this.filter=filters;
      this.loadfilter(filters);

    })
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

  loadCars(params:string): void {
    this.loading = true;
    this.error = false;
    
    this.carService.getCars(params).subscribe({
      next: (cars) => {
        this.totalPages=cars.totalPages!;
        if (cars.content && Array.isArray(cars.content)) {
          this.cars = [...cars.content]; // Create a new array to ensure change detection
          this.filteredCars = [...cars.content]; // Initialize filtered cars with all cars
          
          // Log image URLs for debugging
          if (cars.content && Array.isArray(cars.content)) {
            cars.content.forEach(car => {
            });
          }
          
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
  activefilter:boolean=false;
  param='';
  loadfilter(filters:CarFilterOptions):void{
    this.param=`page=${this.currentPage}`;
    filters.pickupLocation?this.param+='&pickupLocationId='+filters.pickupLocation:'';
    filters.dropoffLocation?this.param+='&dropOffLocationId='+filters.dropoffLocation:'';
    filters.pickupDate?this.param+='&pickupDateTime='+filters.pickupDate:'';
    filters.dropoffDate?this.param+='&dropOffDateTime='+filters.dropoffDate:'';
    filters.fuelType!=='ANY'?this.param+='&fuelType='+filters.fuelType:'';
    filters.gearboxType!=='ANY'?this.param+='&gearBoxType='+filters.gearboxType:'';
    filters.category!=='ANY'?this.param+='&category='+filters.category:'';
    filters.minPrice?this.param+='&minPrice='+filters.minPrice:'';
    filters.maxPrice?this.param+='&maxPrice='+filters.maxPrice:'';
    this.loadCars(this.param);
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
      this.loadfilter(this.filter);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadfilter(this.filter);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadfilter(this.filter);
    }
  }



  // Add trackBy function for better performance
  trackByCar(index: number, car: CarBriefInfo): string {
    return car.carId;
  }
  
  onBookCar(carId: string): void {
    this.loadCarDetails(carId);
  }

  onViewDetails(carId: string): void {
    this.loadCarDetails(carId);
  }
  
  loadCarDetails(carId: string): void {
    this.showDetailsModal = true;
    this.detailsLoading = true;
   this.selectedCarId = carId;
  }
  
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedCarId = '';
  }
  
  bookSelectedCar(carId: string): void {
    // Implement actual booking logic
    // This could navigate to a booking page or show another modal
    
    // For now, just close the modal
    this.closeDetailsModal();
  }

  ngOnDestroy() {
    // Always unsubscribe to prevent memory leaks
    this.subscription.unsubscribe();
    this.searchFilterService.clearFilters();
  }

}