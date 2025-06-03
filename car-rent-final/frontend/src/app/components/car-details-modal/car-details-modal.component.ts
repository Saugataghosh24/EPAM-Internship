 
// src/app/shared/components/car-details-modal/car-details-modal.component.ts
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { ClientReviewService } from '../../services/client-review.service';
import { ClientReview, ClientReviewResponse } from '../../models/ClientReview.models';
import { ButtonComponent } from "../../shared/button/button.component";
import { Router } from '@angular/router';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { DateTimePickerComponent } from "../../shared/date-time-picker/date-time-picker.component";
import { SearchFilterService } from '../../services/filter.service';
import { CarService } from '../../services/car.service';
 
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
  @Input() detailsLoading = false; // <-- Add this line
  @Input() carId: string='';
  @Output() close = new EventEmitter<void>();
  @Output() bookCar = new EventEmitter<string>();
  car= {} as CarDetailsResponseBody;
  currentImageIndex = 0;
  params:string='';
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
  emptyReviews = true;
  //location
  pickupLocation: string = '';
  dropoffLocation: string = '';
  //dates
  dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(new Date().setMinutes(new Date().getMinutes()+30)),
    dropoff: new Date(new Date(new Date().setMinutes(new Date().getMinutes()+330)).setDate(new Date().getDate() + 5))
  };
  @Output() pickerOpen = new EventEmitter<boolean>();
  blockedDates: string[]=[];
  
  openPickup() {
    this.pickerOpen.emit(true);
    this.isPickupVisible=this.isPickupVisible===true?false:true;
  }
  isPickupVisible=false;
  alreadybooked=false;
      selectedDates(dates:{pickup: Date, dropoff: Date}){
        const pickup=dates.pickup;
        const dropoff=dates.dropoff;
        this.dateTime={pickup,dropoff}
      }
      pickerStatus(open:boolean){
        this.isPickupVisible=open;
      }
      
      bookStatus(status:boolean){
        this.alreadybooked=status;
      }
      
      
      
      // Mock feedback data (in a real app, this would come from an API)
      
      constructor(
        private reviewService: ClientReviewService,
        private carService: CarService,
        private searchFilterService: SearchFilterService,
        private elementRef: ElementRef,
        private router:Router
      ) {}
      sortOption='sort=DATE&direction=DESC';
      user:any|null;
      status=false;
      alert="You are not logged in!";
  message="To continue booking a car, you need to log in or create an account";
  ngOnInit(): void {
    this.carService.getCarDetails(this.carId).subscribe({
      next: (car) => {
        this.car = car;
        this.detailsLoading = false;
      },
      error: (error) => {
        console.error('Error loading car details:', error);
        this.detailsLoading = false;
      }
    });

    this.searchFilterService.hasActiveFilters$.subscribe((status) => {
      if(status){
        this.searchFilterService.activeFilters$.subscribe((filters) => {
          this.dateTime.pickup = new Date(filters.pickupDate);
          this.dateTime.dropoff = new Date(filters.dropoffDate);
          if(filters.pickupLocation){
            this.pickupLocation = filters.pickupLocation;
          }
          if(filters.dropoffLocation){
            this.dropoffLocation = filters.dropoffLocation;
          }
        }); 
      }
    }
    );
    this.carService.getCarBookedDays(this.carId).subscribe({
      next: (bookedDays) => {
        this.blockedDates= bookedDays.content;
      }
    });


    // Load reviews for this car
    this.loadReviews();
    this.user=sessionStorage.getItem('user');
  }
  
  
  
  loadReviews(): void {
    this.params=`page=${this.currentReviewPage-1}&${this.sortOption}`;
    this.loadingReviews = true;
    this.reviewError = false;
    this.reviewService.getCarReviews(this.carId,this.params).subscribe({
      next: (reviews) => {
        if(this.reviews.length>0)this.emptyReviews=false;
        this.reviews = reviews.content;
        this.totalReviewPages=reviews.totalPages;
        this.totalReviews = reviews.totalElements;
        this.loadingReviews = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviewError = true;
        this.loadingReviews = false;
      }
    });
  }
  
  getRatingStars(arg0:string): number[] {
    let numb= Number.parseFloat(arg0);
    const rate=new Array(5);
    for(let i=0;i<5;i++){
      if(numb>=1){
        rate[i]=1;
        numb--;
      }
      else if(numb>=0.5){
        rate[i]=0.5;
        numb-=0.5;
      }
      else{
        rate[i]=0;
      }
    }
    return rate;
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
      const queryParams: any = {};
    
    // Add dates if they exist
    if (this.dateTime.pickup) {
      queryParams.pickupDate = this.dateTime.pickup.toISOString();
    }
    
    if (this.dateTime.dropoff) {
      queryParams.dropoffDate = this.dateTime.dropoff.toISOString();
    }
    
    // Add locations if they exist
    if (this.pickupLocation) {
      queryParams.pickupLocation = this.pickupLocation;
    }
    
    if (this.dropoffLocation) {
      queryParams.dropoffLocation = this.dropoffLocation;
    }
    
    // Navigate with query params
    this.router.navigate([`/cars/carbooking/${this.carId}`], {
      queryParams: queryParams
    });
      this.bookCar.emit(this.carId);
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
 
 
 
 
 

 

 
  
 
nextReviewPage(): void {
  if (this.currentReviewPage < this.totalReviewPages) {
    this.currentReviewPage++;
    this.loadReviews(); // Load reviews for the new page
  }
}
 
prevReviewPage(): void {
  if (this.currentReviewPage > 1) {
    this.currentReviewPage--;
  }
  this.loadReviews(); // Load reviews for the new page
}
 
setReviewPage(page: number): void {
  if(page==this.currentReviewPage)
  this.currentReviewPage = page;
  this.loadReviews(); // Load reviews for the new page
}
 
totalReviewPages: number=1 ;
 
get paginatedReviews(): ClientReview[] {
  const startIndex = (this.currentReviewPage - 1) * this.reviewsPerPage;
  return this.reviews;
}
 
get reviewPageNumbers(): number[] {
  return Array.from({ length: this.totalReviewPages }, (_, i) => i + 1);
}
 
changeSortOption(option: string): void {
  this.sortOption = option;
  this.currentReviewPage = 1; // Reset to first page when sorting changes
  this.loadReviews(); // Load reviews with the new sort option
}
 

 
 parseDate(dateStr: string): string {
  // Convert from DD.MM.YYYY to YYYY-MM-DD for proper date comparison
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month}-${day}`;
}
 
sortReviews(): void {
  // The actual sorting is done in the sortedReviews getter
}
 
 
 
// Helper method to get avatar URL or fallback
getAvatarUrl(review: ClientReview): string {
  return review.authorImageUrl || this.defaultAvatarImage;
}
 
}
 