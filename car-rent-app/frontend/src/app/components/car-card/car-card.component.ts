import { Component, Input, Output } from '@angular/core';
import { ButtonComponent } from "../../shared/button/button.component";
import { StatusTagComponent } from "../../shared/status-tag/status-tag.component";
import { EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';

@Component({
  selector: 'app-car-card',
  imports: [ButtonComponent,CommonModule],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.css'
})
export class CarCardComponent {
  @Input() car!: CarDetailsResponseBody;
  @Output() bookCar = new EventEmitter<string>();
  @Output() viewDetails = new EventEmitter<string>();

  getStatusClass(status: string): string {
    switch(status) {
      case 'AVAILABLE': return 'text-black';
      case 'BOOKED': return 'text-amber-500';
      case 'UNAVAILABLE': return 'text-red-500';
      default: return '';
    }
  }
  getImageUrl(): string {
    // If car has images array and it's not empty, use the first image
    if (this.car.images && this.car.images.length > 0) {
      return this.car.images[0];
    }
    
    // Fall back to imageUrl if it exists
    // if ('imageUrl' in this.car) {
    //   return (this.car as any).imageUrl;
    // }
    
    // Default placeholder
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDBkRXExdMYLo4DhjVnGByS7NlXl479tOH8A&s';
  }

 
  onBookCar(): void {
    this.bookCar.emit(this.car.carId);
  }

  onViewDetails(event: Event): void {
    event.preventDefault();
    this.viewDetails.emit(this.car.carId);
  }
 
  
}