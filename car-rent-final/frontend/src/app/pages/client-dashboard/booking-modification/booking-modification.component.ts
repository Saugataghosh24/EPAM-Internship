import { Component, Input } from '@angular/core';
import { AlreadyBookedComponent } from '../../../components/already-booked/already-booked.component';
import { DateTimePickerComponent } from '../../../shared/date-time-picker/date-time-picker.component';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../../services/car.service';
import { CarDetailsResponseBody } from '../../../models/CarDetails.models';
import { BookingService } from '../../../services/booking-info.service';
import { CarBookService } from '../../../services/car-book.service';
import { BookingInfo, Bookings, UserBookings } from '../../../models/BookingInfo.model';
import { BookCar } from '../../../models/BookCar.model';
import { format, differenceInDays } from 'date-fns';
import { LocationInfoService } from '../../../services/location-info.service';
import { LocationInfo } from '../../../models/LocationInfo.model';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { NotificationComponent } from '../../../shared/notification/notification.component';


@Component({
  selector: 'app-booking-modification',
  imports: [AlreadyBookedComponent, DateTimePickerComponent, NgIf, HeaderComponent, FooterComponent, CommonModule, ButtonComponent, FormsModule, NotificationComponent],
  providers: [DatePipe],
  templateUrl: './booking-modification.component.html',
  styleUrl: './booking-modification.component.css'
})
export class BookingModificationComponent {
  constructor(private route: ActivatedRoute, private carinfo: CarService, private router: Router, private userBooking: BookingService, private carBookService: CarBookService, private datePipe: DatePipe, private locationinfoservice: LocationInfoService) { }
  bookingid: string = '';
  carDetails: CarDetailsResponseBody | undefined;
  currentuser: any;
  user!: { username: string, email: string };
  blockedDates: string[] = [];
  isLoading = true;
  availableLocations: LocationInfo[] = [];
  pickup!: LocationInfo;
  dropoff!: LocationInfo;
  selectedBooking: any
  initialDropOffLocation: string = '';
  initialDateTime!: { pickup: Date, dropoff: Date };

  updateLocation = false;

  toggleUpdate() {
    this.updateLocation = !this.updateLocation;
  }

  totalcost: number = 1;
  totaldays: number = 1;

  ngOnInit() {
    // Start with loading state
    this.isLoading = true;
    
    this.currentuser = JSON.parse(sessionStorage.getItem('user') as string);
    if (!this.currentuser) {
      this.router.navigate([`/auth/sign-in`]);
      return;
    }
    this.user = { username: this.currentuser.username, email: this.currentuser.email };

    this.route.params.subscribe((params) => {
      this.bookingid = params['bookingid'];
      
      // Use forkJoin to track all API calls
      forkJoin({
        booking: this.userBooking.getBookingById(this.bookingid),
        // Don't get locations yet as we need booking data first
      }).subscribe({
        next: (results) => {
          this.selectedBooking = results.booking.bookings;
          
          // Now get both locations and blocked dates since we have the booking
          forkJoin({
            locations: this.locationinfoservice.getlocations(),
            blockedDates: this.carinfo.getCarBookedDays(this.selectedBooking.carId)
          }).subscribe({
            next: (secondResults) => {
              this.availableLocations = secondResults.locations.content;
              this.blockedDates = secondResults.blockedDates.content;
              
              this.pickup = this.availableLocations.find(
                (loc) => loc.locationName === this.selectedBooking.pickupLocation
              ) as LocationInfo;
              
              this.dropoff = this.availableLocations.find(
                (loc) => loc.locationName === this.selectedBooking.dropoffLocation
              ) as LocationInfo;
              
              this.initialDropOffLocation = this.dropoff.locationName;
              this.dateTime = {
                pickup: new Date(this.selectedBooking.pickupDateTime),
                dropoff: new Date(this.selectedBooking.dropoffDateTime)
              };
              this.initialDateTime = this.dateTime;
              this.calculateTotal();
              
              // Set loading to false after a small delay to prevent flickering
              setTimeout(() => {
                this.isLoading = false;
              }, 300);
            },
            error: (error) => {
              console.error('Error loading data:', error);
              this.isLoading = false;
            }
          });
        },
        error: (error) => {
          console.error('Error loading booking:', error);
          this.isLoading = false;
        }
      });
    });
  }

  handleImageError(event: any): void {
    event.target.src = 'https://static.foxdealer.com/489/2023/06/no-car-placeholder.png';
    console.warn('Image failed to load, using placeholder instead');
  }

  isPickupVisible = false;
  alreadybooked = false;

  pickerStatus(open: boolean) {
    this.isPickupVisible = open;
  }

  openPickup() {
    this.isPickupVisible = true;
  }

  bookStatus(status: boolean) {
    this.alreadybooked = status;
  }




  //car-summary


  label = "Save";

  dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };
  @Input() car: CarDetailsResponseBody | undefined;

  openAlreadyBooked() {
    this.alreadybooked = true;
  }

  selectedDates(dates: { pickup: Date, dropoff: Date }) {
    const pickup = dates.pickup;
    const dropoff = dates.dropoff;
    this.dateTime = { pickup, dropoff }
    this.calculateTotal();
  }

  userBookingInfo!: UserBookings;
  carBookingDetails!: BookCar;
  showalert = false;
  alert = ''
  message = ''
  success = false;
  buttons = false;
  updateBookingForUser() {
    if ((this.initialDateTime.dropoff !== this.dateTime.dropoff || this.initialDateTime.pickup !== this.dateTime.pickup) && this.initialDropOffLocation !== this.dropoff.locationName) {
      let updates = {
        locationId: this.dropoff.locationId
      }
      let dupdates = {
        pickupDateTime: `${this.datePipe.transform(this.dateTime.pickup, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.pickup, 'HH:mm')}`,
        dropOffDateTime: `${this.datePipe.transform(this.dateTime.dropoff, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.dropoff, 'HH:mm')}`
      }
      forkJoin([
        this.userBooking.updateDateTime(this.bookingid, dupdates),
        this.userBooking.updateLocation(this.bookingid, updates)
      ]).subscribe({
        next: ([dateres, locres]) => {
          this.router.navigate(['/bookings'], {
            state: {
              bookingupdate: "You have successfully updated your booking!"
            }
          });
        },
        error: (err) => {
          this.showalert = true;
          this.alert = 'Invalid Selection';
          this.message = err.error.message;
          setTimeout(() => {
            this.showalert = false;
          }, 4000);
          console.error("Update failed", err);
        }
      })
    }
    else if (this.initialDateTime.dropoff !== this.dateTime.dropoff || this.initialDateTime.pickup !== this.dateTime.pickup) {
      let updates = {
        pickupDateTime: `${this.datePipe.transform(this.dateTime.pickup, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.pickup, 'HH:mm')}`,
        dropOffDateTime: `${this.datePipe.transform(this.dateTime.dropoff, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.dropoff, 'HH:mm')}`
      }
      this.userBooking.updateDateTime(this.bookingid, updates).subscribe({
        next: (res) => {
          this.router.navigate(['/bookings'], {
            state: {
              bookingupdate: "You have successfully updated your booking!"
            }
          });
        },
        error: (err) => {
          this.showalert = true;
          this.alert = 'Invalid Selection';
          this.message = err.error.message;
          setTimeout(() => {
            this.showalert = false;
          }, 4000);
          console.error("Update failed", err);
        }
      })
    }
    else {
      if (this.initialDropOffLocation !== this.dropoff.locationName) {
        let updates = {
          locationId: this.dropoff.locationId
        }
        this.userBooking.updateLocation(this.bookingid, updates).subscribe({
          next: (res) => {
            this.router.navigate(['/bookings'], {
              state: {
                bookingupdate: "You have successfully updated your booking!"
              }
            });
          },
          error: (err) => {
            this.showalert = true;
            this.alert = 'Invalid Selection';
            this.message = err.error.message;
            setTimeout(() => {
              this.showalert = false;
            }, 4000);
            console.error("Update failed", err);
          }
        })
      }
    }


  }

  calculateTotal() {
    if (this.dateTime.pickup && this.dateTime.dropoff) {
      this.totaldays = differenceInDays(
        new Date(this.dateTime.dropoff),
        new Date(this.dateTime.pickup)
      ) + 1;
      if (this.totaldays < 1) {
        this.totaldays = 1;
      }
      else {
        this.totalcost = this.totaldays * Number(this.selectedBooking!.pricePerDay);
      }
    }
  }
}