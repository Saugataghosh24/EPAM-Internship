import { Component, Input } from '@angular/core';
import { AlreadyBookedComponent } from '../../../components/already-booked/already-booked.component';
import { DateTimePickerComponent } from '../../../shared/date-time-picker/date-time-picker.component';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../../services/car-brief-info.service';
import { CarDetailsResponseBody } from '../../../models/CarDetails.models';
import { BookingService } from '../../../services/booking-info.service';
import { CarBookService } from '../../../services/car-book.service';
import { BookingInfo, UserBookings } from '../../../models/BookingInfo.model';
import { BookCar } from '../../../models/BookCar.model';
import { format,differenceInDays } from 'date-fns';
import { LocationInfoService } from '../../../services/location-info.service';
import { LocationInfo } from '../../../models/LocationInfo.model';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-booking-modification',
  imports: [AlreadyBookedComponent, DateTimePickerComponent, NgIf, HeaderComponent, FooterComponent, CommonModule, ButtonComponent, FormsModule],
  providers: [DatePipe],
  templateUrl: './booking-modification.component.html',
  styleUrl: './booking-modification.component.css'
})
export class BookingModificationComponent {
  constructor(private route: ActivatedRoute, private carinfo: CarService, private router: Router, private userBooking: BookingService, private carBookService: CarBookService, private datePipe: DatePipe, private locationinfoservice: LocationInfoService) { }
  carid: string = '';
  carDetails: CarDetailsResponseBody | undefined;
  currentuser: any;
  user!: { username: string, email: string };

  availableLocations: LocationInfo[] = [];
  pickup!: LocationInfo;
  dropoff!: LocationInfo;

  bookdet!:BookingInfo;
  updateLocation = false;

  toggleUpdate() {
    this.updateLocation = !this.updateLocation;
  }

  totalcost: number=1;
  totaldays: number=1;

  ngOnInit() {
    
    this.currentuser = JSON.parse(sessionStorage.getItem('user') as string);
    if (!this.currentuser) {
      this.router.navigate([`/auth/sign-in`])
    }
    this.user = { username: this.currentuser.username, email: this.currentuser.email }

    this.route.params.subscribe((params) => {
      this.carid = params['carid']; //this is booking is here
      console.log(this.carid)
    })
    this.userBooking.getAllBookings().subscribe((bookingDetails)=>{
      const userBook=bookingDetails.find((bookings)=>{
        return bookings.userId==this.currentuser.userId;
      })

      this.bookdet=userBook!.bookings.find(b=>b.bookingId==this.carid) as BookingInfo;
      console.log("bookdet: ",this.bookdet);

    })

    
      
      this.locationinfoservice.getLocationInfo().subscribe((locations) => {
        this.availableLocations = locations;
        this.pickup=this.availableLocations[0];
        this.dropoff=this.availableLocations[0];
        console.log(this.pickup)
      })
    




    this.carinfo.getCarDetails(this.carid).subscribe((details) => {
      this.carDetails = details;
      console.log(this.carDetails)
    })
    
    
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
    console.log(this.alreadybooked);
  }




  //car-summary


  label = "Save";

  @Input() dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };
  @Input() car: CarDetailsResponseBody | undefined;
  @Input() locationids: {
    pickupid: string, dropoffid: string
  } = { pickupid: '9b903ebf-2b18-4946-bc58-045d86a2632e', dropoffid: '9b903ebf-2b18-4946-bc58-045d86a2632e' };

  openAlreadyBooked() {
    this.alreadybooked = true;
  }

  selectedDates(dates: { pickup: Date, dropoff: Date }) {
    const pickup = dates.pickup;
    const dropoff = dates.dropoff;
    this.dateTime = { pickup, dropoff }
    // console.log(dates);
    this.totaldays = differenceInDays(
      new Date(this.dateTime.dropoff),
      new Date(this.dateTime.pickup)
    ) + 1;
    if (this.totaldays <= 1) {
      this.totaldays = 1;
    }
    else{
      this.totalcost=this.totaldays * 332;
      // console.log(this.totalcost)
    }
  }

  userBookingInfo!: UserBookings;
  carBookingDetails!: BookCar;

  addBookingForUser() {
    this.router.navigate(['/bookings'],{
      state:{
        bookingupdate:"You have successfully updated your booking!"
      }
    });
  }
}



