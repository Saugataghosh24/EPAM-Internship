 
// src/app/shared/components/car-details-modal/car-details-modal.component.ts
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { ClientReviewService } from '../../services/client-review.service';
import { ClientReview } from '../../models/ClientReview.models';
import { ButtonComponent } from "../../shared/button/button.component";
import { Router } from '@angular/router';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { DateTimePickerComponent } from "../../shared/date-time-picker/date-time-picker.component";
 
interface Feedback {
  id: string;
  userName: string;
  userInitial: string;
  rating: number;
  comment: string;
  date: string;
}
 
@Component({
  selector: 'app-car-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, NotificationComponent, DateTimePickerComponent],
  templateUrl: './car-details-modal.component.html',
  providers: [ClientReviewService] // Add the service as a provider
 
})
export class CarDetailsModalComponent implements OnInit {
  @Input() car!: CarDetailsResponseBody;
  @Output() close = new EventEmitter<void>();
  @Output() bookCar = new EventEmitter<string>();
 
  currentImageIndex = 0;
 
  sortOption = 'newest';
 
  currentReviewPage = 1;
  reviewsPerPage = 3;
 
  defaultImage = 'assets/images/placeholder-car.jpg';
  defaultAvatarImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Windows_10_Default_Profile_Picture.svg/2048px-Windows_10_Default_Profile_Picture.svg.png';
 
    // Review data
    reviews: ClientReview[] = [];
    loadingReviews = true;
    reviewError = false;
    averageRating = 0;
    totalReviews = 0;

    //dates
      dateTime: { pickup: Date, dropoff: Date } = {
        pickup: new Date(),
        dropoff: new Date()
      };
    
      // @Output() pickerOpen = new EventEmitter<boolean>();
      
      openPickup() {
        // this.pickerOpen.emit(true);
        this.isPickupVisible=this.isPickupVisible===true?false:true;
      }
      isPickupVisible=false;
      alreadybooked=false;
    
      pickerStatus(open:boolean){
        this.isPickupVisible=open;
      }
    
      bookStatus(status:boolean){
        this.alreadybooked=status;
        console.log(this.alreadybooked);
      }
  
      selectedDates(dates:{pickup: Date, dropoff: Date}){
        const pickup=dates.pickup;
        const dropoff=dates.dropoff;
        this.dateTime={pickup,dropoff}
        // console.log(dates);
      }
    
 
  // Mock feedback data (in a real app, this would come from an API)
 
  constructor(
    private reviewService: ClientReviewService,
    private elementRef: ElementRef,
    private router:Router
  ) {}
  user:any|null;
  status=false;
  alert="You are not logged in!";
  message="To continue booking a car, you need to log in or create an account";
  ngOnInit(): void {
    this.sortFeedbacks();
       // Load reviews for this car
       this.loadReviews();
       this.loadAverageRating();
       this.user=sessionStorage.getItem('user');
  }
 
 
 
  loadReviews(): void {
    this.loadingReviews = true;
    this.reviewError = false;
 
    this.reviewService.getCarReviews(this.car.carId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.totalReviews = reviews.length;
        this.sortReviews();
        this.loadingReviews = false;
        
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviewError = true;
        this.loadingReviews = false;
      }
    });
  }
 
  loadAverageRating(): void {
    this.reviewService.getAverageRating(this.car.carId).subscribe({
      next: (rating) => {
        this.averageRating = rating;
      },
      error: (error) => {
        console.error('Error loading average rating:', error);
      }
    });
  }
 
  // Get current image with safety check
  get currentImage(): string {
    if (!this.car.images || this.car.images.length === 0) {
      return this.defaultImage;
    }
   
    if (this.currentImageIndex >= this.car.images.length) {
      this.currentImageIndex = 0;
    }
   
    return this.car.images[this.currentImageIndex] || this.defaultImage;
  }
 
  closeModal(): void {
    this.close.emit();
  }
  showalert=false;
  bookCarNow(): void {
    if(!this.user){
      this.showalert=true;
      setTimeout(() => {
        this.showalert=false;
      }, 5000);
    }
    else{
      this.bookCar.emit(this.car.carId);
      this.router.navigate([`/cars/carbooking/${this.car.carId}`]);
    }
  }
 
  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.car.images.length;
  }
 
  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.car.images.length) % this.car.images.length;
  }
 
  setImage(index: number): void {
    this.currentImageIndex = index;
  }
 
 
 
 
 

 
  sortFeedbacks(): void {
    // The actual sorting is done in the sortedFeedbacks getter
  }
 
 
  // Add these methods to car-details-modal.component.ts
getFuelTypeDisplay(fuelType: string): string {
  switch (fuelType) {
    case 'PETROL': return 'Petrol';
    case 'DIESEL': return 'Diesel';
    case 'ELECTRIC': return 'Electric';
    case 'HYBRID': return 'Hybrid';
    default: return fuelType;
  }
}
 
getClimateControlDisplay(option: string): string {
  switch (option) {
    case 'NONE': return 'No climate control';
    case 'AIR_CONDITIONER': return 'Air conditioner';
    case 'CLIMATE_CONTROL': return 'Climate control';
    case 'TWO_ZONE_CLIMATE_CONTROL': return 'Two-zone climate control';
    default: return 'Climate control';
  }
}
 
nextReviewPage(): void {
  if (this.currentReviewPage < this.totalReviewPages) {
    this.currentReviewPage++;
  }
}
 
prevReviewPage(): void {
  if (this.currentReviewPage > 1) {
    this.currentReviewPage--;
  }
}
 
setReviewPage(page: number): void {
  this.currentReviewPage = page;
}
 
get totalReviewPages(): number {
  return Math.ceil(this.reviews.length / this.reviewsPerPage);
}
 
get paginatedReviews(): ClientReview[] {
  const startIndex = (this.currentReviewPage - 1) * this.reviewsPerPage;
  return this.sortedReviews.slice(startIndex, startIndex + this.reviewsPerPage);
}
 
get reviewPageNumbers(): number[] {
  return Array.from({ length: this.totalReviewPages }, (_, i) => i + 1);
}
 
changeSortOption(option: string): void {
  this.sortOption = option;
  this.sortReviews();
  this.currentReviewPage = 1; // Reset to first page when sorting changes
}
 
get sortedReviews(): ClientReview[] {
  return [...this.reviews].sort((a, b) => {
    const dateA = new Date(this.parseDate(a.date));
    const dateB = new Date(this.parseDate(b.date));
   
    if (this.sortOption === 'newest') {
      return dateB.getTime() - dateA.getTime();
    } else if (this.sortOption === 'oldest') {
      return dateA.getTime() - dateB.getTime();
    } else if (this.sortOption === 'highest') {
      return parseFloat(b.rentalExperience) - parseFloat(a.rentalExperience);
    } else { // lowest
      return parseFloat(a.rentalExperience) - parseFloat(b.rentalExperience);
    }
  });
}
 
 parseDate(dateStr: string): string {
  // Convert from DD.MM.YYYY to YYYY-MM-DD for proper date comparison
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month}-${day}`;
}
 
sortReviews(): void {
  // The actual sorting is done in the sortedReviews getter
}
 
// Helper method to generate an array of stars for ratings
getRatingStars(rating: string | number): number[] {
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const fullStars = Math.floor(numRating);
  const hasHalfStar = numRating - fullStars >= 0.5;
 
  // Create an array of 5 elements
  const stars: number[] = [];
 
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(1);
  }
 
  // Add half star if needed
  if (hasHalfStar && stars.length < 5) {
    stars.push(0.5);
  }
 
  // Fill the rest with empty stars
  while (stars.length < 5) {
    stars.push(0);
  }
  return stars;
}
 
 
// Helper method to get avatar URL or fallback
getAvatarUrl(review: ClientReview): string {
  return review.authorImageUrl || this.defaultAvatarImage;
}
 
}
 