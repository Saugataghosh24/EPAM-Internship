import { Component } from '@angular/core';
import { ButtonComponent } from "../../../shared/button/button.component";
import { CarCardComponent } from "../../../components/car-card/car-card.component";
import { CarService } from '../../../services/car.service';
import { ActiveButtonService } from '../../../services/active-button.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarDetailsResponseBody } from '../../../models/CarDetails.models';
import { CarDetailsModalComponent } from "../../../components/car-details-modal/car-details-modal.component";
import { CarBriefInfo } from '../../../models/CarBriefInfo.model';
const EMPTY_CAR: CarDetailsResponseBody = {
  carId: '',
  model: '',
  carRating: '',
  climateControlOption: 'NONE',
  engineCapacity: '',
  fuelConsumption: '',
  fuelType: 'PETROL',
  gearBoxType: 'MANUAL',
  images: [],
  location: '',
  passengerCapacity: '',
  pricePerDay: '',
  serviceRating: '',
  status: 'AVAILABLE',
  carCategory: 'ECONOMY'
};
@Component({
  selector: 'app-popular-cars',
  imports: [ButtonComponent, CarCardComponent, CommonModule, RouterLink, CarDetailsModalComponent],
  templateUrl: './popular-cars.component.html',
  styleUrl: './popular-cars.component.css'
})
export class PopularCarsComponent {
cars: CarBriefInfo[] = [];
  availableCars: CarDetailsResponseBody[] = [];
  bookedCars: CarDetailsResponseBody[] = [];
  unavailableCars: CarDetailsResponseBody[] = [];
  isLoading = true;
  loading = true;
  error = false;
  showDetailsModal = false;
  selectedCarId: string='';
  detailsLoading = false;

  constructor(private carService: CarService,
      private activeButtonService: ActiveButtonService,
  
    ) {}
  ngOnInit(): void {
    this.loadCars();

  }

  loadCars(): void {
    this.loading = true;
    this.error = false;
    
    this.carService.getPopularCars().subscribe({
      next: (cars) => {
        this.cars=cars.content.slice(0, 4);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error in component:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  // categorizeCarsByStatus(): void {
  //   // First sort by rating in descending order
  //   const sortedCars = [...this.cars].sort((a, b) => {
  //     const ratingA = parseFloat(a.carRating) || 0;
  //     const ratingB = parseFloat(b.carRating) || 0;
  //     return ratingB - ratingA;
  //   });
    
  //   // Then categorize while maintaining the top 4
  //   this.availableCars = sortedCars.filter(car => car.status === 'AVAILABLE');
  //   this.bookedCars = sortedCars.filter(car => car.status === 'BOOKED');
  //   this.unavailableCars = sortedCars.filter(car => car.status === 'UNAVAILABLE');
    
  //   // Combine in the required order (available first, then booked, then unavailable)
  //   // But still limited to the top 4 overall
  //   this.cars = [...this.availableCars].slice(0, 4);
  // }

  getStatusClass(status: string): string {
    switch(status) {
      case 'available': return 'text-green-500';
      case 'booked': return 'text-amber-500';
      case 'unavailable': return 'text-red-500';
      default: return '';
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
    // Show modal immediately with skeleton
    this.selectedCarId = carId ; // minimal info for skeleton
    this.detailsLoading = true;
    this.showDetailsModal = true;
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
  
}
