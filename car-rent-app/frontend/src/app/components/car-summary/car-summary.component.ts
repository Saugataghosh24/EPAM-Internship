import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { BookingService } from '../../services/booking-info.service';
import { BookingInfo, UserBookings } from '../../models/BookingInfo.model';
import { format,differenceInDays,subDays  } from 'date-fns';
import { Router } from '@angular/router';
import { BookCar } from '../../models/BookCar.model';
import { CarBookService } from '../../services/car-book.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-car-summary',
  imports: [ButtonComponent, CommonModule],
  providers: [DatePipe],
  templateUrl: './car-summary.component.html',
  styleUrl: './car-summary.component.css'
})
export class CarSummaryComponent {
  constructor(private userBooking: BookingService, private router: Router, private carBookService: CarBookService, private datePipe: DatePipe) { }
  label = "Confirm reservation";

  @Output() alreadybooked = new EventEmitter<boolean>(false);

  @Input() dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };
  @Input() car: CarDetailsResponseBody | undefined;
  @Input() locationids: {
    pickupid: string, dropoffid: string
  } = { pickupid: '9b903ebf-2b18-4946-bc58-045d86a2632e', dropoffid: '9b903ebf-2b18-4946-bc58-045d86a2632e' };

  openAlreadyBooked() {
    this.alreadybooked.emit(true);
  }

  user!: { userId: string, userName: string };
  status=true;
  alert="Congratulations!";
  message:string="";

  totalcost: number=1;
  totaldays: number=1;
  ngOnInit() {
    this.user = {
      userId: JSON.parse(sessionStorage.getItem('user') as string).userId,
      userName: JSON.parse(sessionStorage.getItem('user') as string).username
    }

    this.totalcost=this.totaldays * Number(this.car!.pricePerDay);

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
      else{
        this.totalcost=this.totaldays * Number(this.car!.pricePerDay);
      }
    }
  }

  userBookingInfo!: UserBookings;
  carBookingDetails!: BookCar;

  addBookingForUser() {
    

    const yesterday = subDays(this.dateTime.pickup, 1);

    

    const formattedDate = format(new Date(), 'dd.MM.yyyy');
    
    const isFiveDigit = Math.random() < 0.5;
    const randomNumber = isFiveDigit
      ? Math.floor(10000 + Math.random() * 90000)
      : Math.floor(1000 + Math.random() * 9000);

    // Prepare new booking range
    const newPickup = new Date(this.dateTime.pickup);
    const newDropoff = new Date(this.dateTime.dropoff);

    // 1. Check if car is already booked in the selected range
    this.carBookService.getBookedCars().subscribe((allBookings) => {
      const bookingsForCar = allBookings.filter(b => b.carId === this.car?.carId);

      const isConflict = bookingsForCar.some(b => {
        const existingPickup = new Date(b.pickupDateTime);
        const existingDropoff = new Date(b.dropOffDateTime);
        
        newPickup.setSeconds(0, 0);
        newDropoff.setSeconds(0, 0);
        existingPickup.setSeconds(0, 0);
        existingDropoff.setSeconds(0, 0);
        return (
          !isNaN(existingPickup.getTime()) &&
          !isNaN(existingDropoff.getTime()) &&
          newPickup < existingDropoff &&
          newDropoff > existingPickup
        );
      });

      if (isConflict) {
        this.openAlreadyBooked(); 
        return;
      }

     
      const bookingId = crypto.randomUUID();
      const bookingDetails: BookingInfo = {
        bookingId: bookingId,
        bookingStatus: "reserved",
        carImageUrl: this.car!.images[0],
        carModel: this.car!.model,
        orderDetails: `#${randomNumber} (${formattedDate})`
      }
      
      this.message=`${this.car?.model} is booked for ${format(this.dateTime.pickup, 'MMM d')} - ${format(this.dateTime.dropoff, 'MMM d')}. You can change booking details until 10:30PM ${format(yesterday, 'd MMM')}. Your order: #${randomNumber} (${formattedDate})`;

      this.userBooking.getAllBookings().subscribe((bookings) => {
        const existingUserBooking = bookings.find(u => u.userId === this.user.userId);

        if (existingUserBooking) {
          existingUserBooking.bookings.push(bookingDetails);
          this.userBooking.updateBooking(existingUserBooking.userId, existingUserBooking).subscribe(() => {
            this.router.navigate(['/bookings'],{
              state: {
                alert: 'Congratulations!',
                message: this.message,
                success: true
              }
            });
          });
        } else {
          const userBookingInfo: UserBookings = {
            userId: this.user.userId,
            userName: this.user.userName,
            bookings: [bookingDetails]
          }
          this.userBooking.addBooking(userBookingInfo).subscribe(() => {
            this.router.navigate(['/bookings'],{
              state: {
                alert: 'Congratulations!',
                message: this.message,
                success: true
              }
            });
          });
        }
      });

      this.carBookingDetails = {
        carId: this.car!.carId,
        clientId: this.user.userId,
        dropOffDateTime: `${this.datePipe.transform(this.dateTime.dropoff, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.dropoff, 'HH:mm')}`,
        dropOffLocationId: this.locationids.dropoffid,
        pickupDateTime: `${this.datePipe.transform(this.dateTime.pickup, 'yyyy-MM-dd')} ${this.datePipe.transform(this.dateTime.pickup, 'HH:mm')}`,
        pickupLocationId: this.locationids.pickupid
      };

      this.carBookService.addNewBooking(this.carBookingDetails).subscribe((car) => {
        console.log("New booking added:", car);
      });
    });
  }

}
