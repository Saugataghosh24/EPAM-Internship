import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { BookingService } from '../../services/booking-info.service';
import { BookingInfo, UserBookings } from '../../models/BookingInfo.model';
import { format, differenceInDays, subDays } from 'date-fns';
import { Router } from '@angular/router';
import { BookCar } from '../../models/BookCar.model';
import { CarBookService } from '../../services/car-book.service';
import { CommonModule, DatePipe } from '@angular/common';
import { LocationInfoService } from '../../services/location-info.service';

@Component({
  selector: 'app-car-summary',
  imports: [ButtonComponent, CommonModule],
  providers: [DatePipe],
  templateUrl: './car-summary.component.html',
  styleUrl: './car-summary.component.css'
})
export class CarSummaryComponent {
  constructor(private userBooking: BookingService, private router: Router, private carBookService: CarBookService, private datePipe: DatePipe, private locationService: LocationInfoService) { }
  label = "Confirm reservation";

  @Output() alreadybooked = new EventEmitter<boolean>(false);
  @Output() sendalert = new EventEmitter<{ alert: string, message: string, success: boolean }>();

  @Input() dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };

  @Input() clientDet: { userId: string, userName: string } = {
    userId: '',
    userName: ''
  };

  @Input() car: any;
  @Input() locationids!: {
    pickupid: string, dropoffid: string
  };

  openAlreadyBooked() {
    this.alreadybooked.emit(true);
  }

  user!: { userId: string, userName: string };
  status = true;
  alert = "Congratulations!";
  message: string = "";
  cuser: any;
  totalcost: number = 1;
  totaldays: number = 1;

  ngOnInit() {
    this.cuser = JSON.parse(sessionStorage.getItem('user') as string);
    this.user = {
      userId: JSON.parse(sessionStorage.getItem('user') as string).userId,
      userName: JSON.parse(sessionStorage.getItem('user') as string).username
    }

    this.totalcost = this.totaldays * Number(this.car!.pricePerDay);

    this.locationService.getlocations().subscribe((loc) => {
      this.locationids = { pickupid: loc[0]._id, dropoffid: loc[0]._id };
    })

  }

  ngOnChanges() {
    if (this.dateTime.pickup && this.dateTime.dropoff) {
      this.totaldays = differenceInDays(
        new Date(this.dateTime.dropoff),
        new Date(this.dateTime.pickup)
      ) + 1;
      if (this.totaldays < 1) {
        this.totaldays = 1;
      }
      else {
        this.totalcost = this.totaldays * Number(this.car!.pricePerDay);
      }
    }
  }

  userBookingInfo!: UserBookings;
  carBookingDetails!: BookCar;

  handleImageError(event: any): void {
    event.target.src = 'https://static.foxdealer.com/489/2023/06/no-car-placeholder.png';
    console.warn('Image failed to load, using placeholder instead');
  }

  addBookingForUser() {
    // if (this.cuser.role === 'Support') {
    //   setTimeout(() => {
    //     this.router.navigate(['/'], {
    //       state: {
    //         alert: 'Congratulations!',
    //         message: 'New Booking was successfully created!',
    //         success: true
    //       }
    //     });
    //   }, 1000);
    // }

    const isConflict = ''

    if (isConflict) {
      this.openAlreadyBooked();
      return;
    }
    if (this.cuser.role === 'Support') {
      this.carBookingDetails = {
        carId: this.car!.carId,
        clientId: this.clientDet.userId,
        dropOffDateTime: `${this.datePipe.transform(this.dateTime.dropoff, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.dropoff, 'HH:mm')}`,
        dropOffLocationId: this.locationids.dropoffid,
        pickupDateTime: `${this.datePipe.transform(this.dateTime.pickup, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.pickup, 'HH:mm')}`,
        pickupLocationId: this.locationids.pickupid,
        supportAgentId: this.user.userId
      };
    }
    else {
      this.carBookingDetails = {
        carId: this.car!.carId,
        clientId: this.user.userId,
        dropOffDateTime: `${this.datePipe.transform(this.dateTime.dropoff, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.dropoff, 'HH:mm')}`,
        dropOffLocationId: this.locationids.dropoffid,
        pickupDateTime: `${this.datePipe.transform(this.dateTime.pickup, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.pickup, 'HH:mm')}`,
        pickupLocationId: this.locationids.pickupid
      };
    }


    this.carBookService.addNewBooking(this.carBookingDetails).subscribe(
      {
        next: (res) => {
          if (this.cuser.role === 'Support') {
            this.router.navigate(['/bookings'], {
              state: {
                alert: 'Congratulations',
                message: res.message,
                success: true
              }
            })
          }
          else {
            this.router.navigate(['/mybookings'], {
              state: {
                alert: 'Congratulations',
                message: res.message,
                success: true
              }
            })
          }
        },
        error: (err) => {
          // console.error('Booking failed:', err);
          const message = err.error.message;
          this.showNotification('Invalid Selection', message, false);
        }
      }
    )
  }

  showNotification(alert: string, message: string, success: boolean) {
    this.sendalert.emit({ alert, message, success });
  }
}
