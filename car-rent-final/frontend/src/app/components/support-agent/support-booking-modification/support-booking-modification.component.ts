import { Component } from '@angular/core';
import { AlreadyBookedComponent } from '../../already-booked/already-booked.component';
import { DateTimePickerComponent } from '../../../shared/date-time-picker/date-time-picker.component';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../../services/car.service';
import { CarDetailsResponseBody } from '../../../models/CarDetails.models';
import { LocationInfoService } from '../../../services/location-info.service';
import { LocationInfo } from '../../../models/LocationInfo.model';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking-info.service';
import { CarBookService } from '../../../services/car-book.service';
import { differenceInDays, format, subDays } from 'date-fns';
import { BookingInfo, UserBookings } from '../../../models/BookingInfo.model';
import { BookCar } from '../../../models/BookCar.model';
import { BookingsService } from '../../../services/bookings.service';
import { AuthService } from '../../../services/auth.service';
import { forkJoin } from 'rxjs';
import e from 'express';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-support-booking-modification',
  imports: [AlreadyBookedComponent, DateTimePickerComponent, NgIf, HeaderComponent, FooterComponent, CommonModule, ButtonComponent, FormsModule, NotificationComponent],
  providers: [DatePipe],
  templateUrl: './support-booking-modification.component.html',
  styleUrl: './support-booking-modification.component.css'
})
export class SupportBookingModificationComponent {
  constructor(private route: ActivatedRoute, private carinfo: CarService, private router: Router, private locationinfoservice: LocationInfoService, private userBooking: BookingService, private carBookService: CarBookService, private datePipe: DatePipe, private bookingsService: BookingsService, private authService: AuthService) { }
  bookingid: string = '';
  carid: string = '';
  carDetails: any;
  currentuser: any;
  user: { username: string, email: string } | undefined;
  selectedBooking: any;
  initialDropOffLocation: string = '';
  initialDateTime!: { pickup: Date, dropoff: Date };
  elabel = ''

  ngOnInit() {


    this.currentuser = JSON.parse(sessionStorage.getItem('user') as string);
    if (!this.currentuser) {
      this.router.navigate([`/auth/sign-in`])
    }
    this.user = { username: this.currentuser.username, email: this.currentuser.email }



    this.route.params.subscribe((params) => {
      this.bookingid = params['bookingid'];

      this.userBooking.getBookingById(this.bookingid).subscribe((booking) => {
        this.selectedBooking = booking.bookings;
        if (this.selectedBooking.bookingStatus === 'RESERVED' || this.selectedBooking.bookingStatus === 'RESERVEDBYSUPPORTAGENT') {
          this.label = 'Service Started';
        }
        else if (this.selectedBooking.bookingStatus === 'SERVICESTARTED') {
          this.label = 'Service Provided';
          this.mileage = String(this.selectedBooking.startMilage);
          this.updatemileage = false;
        }
        else if (this.selectedBooking.bookingStatus === 'SERVICEPROVIDED') {
          this.elabel = 'Service Provided';
          this.label = 'Booking Finished';
          this.mileage = String(this.selectedBooking.startMilage);
          this.updatemileage = false;
          this.emileage = String(this.selectedBooking.endMilage);
          this.updatendmileage = false;
        }
        else {
          this.elabel = '';
          this.label = this.getBookingStatus(this.selectedBooking.bookingStatus);
          this.mileage = String(this.selectedBooking.startMilage);
          this.updatemileage = false;
          this.emileage = String(this.selectedBooking.endMilage);
          this.updatendmileage = false;
        }


        this.clt = this.selectedBooking.clientName;
        this.locationinfoservice.getlocations().subscribe((locations) => {
          this.availableLocations = locations.content;
          this.pickup = this.availableLocations.find((loc) => loc.locationName === this.selectedBooking.pickupLocation) as LocationInfo;
          this.dropoff = this.availableLocations.find((loc) => loc.locationName === this.selectedBooking.dropoffLocation) as LocationInfo;
          this.initialDropOffLocation = this.dropoff.locationName;

          this.dateTime = {
            pickup: new Date(this.selectedBooking.pickupDateTime),
            dropoff: new Date(this.selectedBooking.dropoffDateTime)
          }
          this.initialDateTime = this.dateTime;
          this.calculateTotal();
        })
      })

    })

  }

  showalert = false;
  alert = 'Congratulations!'
  message = ''
  success = false;
  buttons = false;
  pickup!: LocationInfo;
  dropoff!: LocationInfo;

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

  isPickupVisible = false;
  alreadybooked = false;

  pickerStatus(open: boolean) {
    this.isPickupVisible = open;
  }

  bookStatus(status: boolean) {
    this.alreadybooked = status;
  }

  dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };

  selectedDates(dates: { pickup: Date, dropoff: Date }) {
    const pickup = dates.pickup;
    const dropoff = dates.dropoff;
    this.dateTime = { pickup, dropoff }
    this.calculateTotal();
    this.updatedate();
  }

  locationids: {
    pickupid: string, dropoffid: string
  } = { pickupid: '', dropoffid: '' };

  selectedLocationIds(locationids: {
    pickupid: string, dropoffid: string
  }) {
    this.locationids.pickupid = locationids.pickupid;
    this.locationids.dropoffid = locationids.dropoffid;
  }

  //new
  clt = 'Client Name'


  availableLocations: LocationInfo[] = [];


  cuser = JSON.parse(sessionStorage.getItem('user') as string);
  updateLocation = false;


  toggleUpdate() {
    if (this.updateLocation === true) {
      if (this.initialDropOffLocation !== this.dropoff.locationName) {
        let updates = {
          locationId: this.dropoff.locationId
        }
        this.userBooking.updateLocation(this.bookingid, updates).subscribe({
          next: (res) => {
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
    this.updateLocation = !this.updateLocation;
  }



  changedate = false;
  openPickup() {
    this.isPickupVisible = true;
  }
  mileage: string = ''
  updatemileage = true;
  endmileage = false;
  emileage: string = '';
  updatendmileage = true;
  showMileageMessage = '';

  updatedate() {
    
    if (this.initialDateTime.dropoff !== this.dateTime.dropoff && this.initialDateTime.pickup !== this.dateTime.pickup) {
      let updates = {
        pickupDateTime: `${this.datePipe.transform(this.dateTime.pickup, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.pickup, 'HH:mm')}`,
        dropOffDateTime: `${this.datePipe.transform(this.dateTime.dropoff, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.dropoff, 'HH:mm')}`
      }
      this.userBooking.updateDateTime(this.bookingid, updates).subscribe({
        next: (res) => {
          this.changedate = false;
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

  toggleMileage() {
    if (this.mileage !== '') {
      if (Number(this.mileage) < this.selectedBooking.carmilage) {
        this.showMileageMessage = "Start Mileage can not be less than Car Mileage!"
      }
      else {
        this.updatemileage = !this.updatemileage;
        this.showMileageMessage = ""
      }
    }

    if (this.updatemileage === false && this.mileage !== '') {
      this.disabled = false;
    }
    else {
      this.disabled = true;
    }
  }
  toggleEndMileage() {

    if (this.emileage !== '') {
      if (this.emileage <= this.mileage) {
        this.showMileageMessage = "End Mileage should be greater than Start Mileage";
      }
      else {
        this.updatendmileage = !this.updatendmileage;
        this.showMileageMessage = "";
      }
    }

    if (this.updatendmileage === false && this.emileage !== '') {
      this.disabled = false;
    }
    else {
      this.disabled = true;
    }
  }



  label = "Service Started";
  disabled = true;





  openAlreadyBooked() {
    this.alreadybooked = true;
  }

  handleImageError(event: any): void {
    event.target.src = 'https://static.foxdealer.com/489/2023/06/no-car-placeholder.png';
    console.warn('Image failed to load, using placeholder instead');
  }

  status = true;
  totalcost: number = 1;
  totaldays: number = 1;


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

  getBookingStatus(status: string): string {
    switch (status) {
      case 'RESERVED':
      case 'RESERVEDBYSUPPORTAGENT':
        return 'Reserved';
      case 'SERVICESTARTED':
        return 'Service Started';
      case 'SERVICEPROVIDED':
        return 'Service Provided';
      case 'BOOKINGFINISHED':
        return 'Booking Finished';
      default:
        return 'Cancelled';
    }
  }

  userBookingInfo!: UserBookings;
  carBookingDetails!: BookCar;

  updateStatus() {
    if (this.label === "Service Started") {

      let update = {
        startMilage: Number(this.mileage)
      }
      this.userBooking.startService(this.bookingid, update).subscribe({
        next: (res) => {
          this.label = "Service Provided";
          this.disabled = true;
          this.endmileage = true;
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.showalert = true;
          this.alert = "Invalid Selection";
          this.success = false;
          this.message = err.error.message;
          this.buttons = false;
          setTimeout(() => {
            this.showalert = false;
          }, 4000);
        }
      })
    }
    if (this.label === "Service Provided") {

      let update = {
        endMilage: Number(this.emileage)
      }
      this.userBooking.endService(this.bookingid, update).subscribe({
        next: (res) => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.showalert = true;
          this.alert = "Invalid Selection";
          this.success = false;
          this.message = err.error.message;
          this.buttons = false;
          setTimeout(() => {
            this.showalert = false;
          }, 4000);
        }
      })
    }
  }
}