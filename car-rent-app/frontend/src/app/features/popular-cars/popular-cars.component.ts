import { Component } from '@angular/core';
import { ButtonComponent } from "../../shared/button/button.component";
import { CarCardComponent } from "../../components/car-card/car-card.component";
import { CarService } from '../../services/car-brief-info.service';
import { ActiveButtonService } from '../../services/active-button.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { CarDetailsModalComponent } from "../../components/car-details-modal/car-details-modal.component";

@Component({
  selector: 'app-popular-cars',
  imports: [ButtonComponent, CarCardComponent, CommonModule, RouterLink, CarDetailsModalComponent],
  templateUrl: './popular-cars.component.html',
  styleUrl: './popular-cars.component.css'
})
export class PopularCarsComponent {
cars: CarDetailsResponseBody[] = [];
  availableCars: CarDetailsResponseBody[] = [];
  bookedCars: CarDetailsResponseBody[] = [];
  unavailableCars: CarDetailsResponseBody[] = [];

  loading = true;
  error = false;
  showDetailsModal = false;
  selectedCar: CarDetailsResponseBody | null = null;

  constructor(private carService: CarService,
      private activeButtonService: ActiveButtonService,
  
    ) {}
  ngOnInit(): void {
    this.loadCars();

  }

  loadCars(): void {
    this.loading = true;
    this.error = false;
    
    this.carService.getCars().subscribe({
      next: (cars) => {
        if (cars && Array.isArray(cars)) {
          // Sort cars by rating in descending order (converting string to number)
          this.cars = [...cars].sort((a, b) => {
            const ratingA = parseFloat(a.carRating) || 0;
            const ratingB = parseFloat(b.carRating) || 0;
            return ratingB - ratingA;
          });
          
          // Take only the top 4 cars
          
          // Log image URLs for debugging
          this.cars.forEach(car => {
          });
          
          this.categorizeCarsByStatus();
        } else {
          console.error('Received invalid cars data:', cars);
          this.cars = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error in component:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  categorizeCarsByStatus(): void {
    // First sort by rating in descending order
    const sortedCars = [...this.cars].sort((a, b) => {
      const ratingA = parseFloat(a.carRating) || 0;
      const ratingB = parseFloat(b.carRating) || 0;
      return ratingB - ratingA;
    });
    
    // Then categorize while maintaining the top 4
    this.availableCars = sortedCars.filter(car => car.status === 'AVAILABLE');
    this.bookedCars = sortedCars.filter(car => car.status === 'BOOKED');
    this.unavailableCars = sortedCars.filter(car => car.status === 'UNAVAILABLE');
    
    // Combine in the required order (available first, then booked, then unavailable)
    // But still limited to the top 4 overall
    this.cars = [...this.availableCars].slice(0, 4);
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
