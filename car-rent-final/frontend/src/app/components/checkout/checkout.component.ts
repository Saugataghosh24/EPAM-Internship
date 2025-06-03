import { Component, EventEmitter, Output } from '@angular/core';
import { AlreadyBookedComponent } from '../already-booked/already-booked.component';
import { DateTimePickerComponent } from '../../shared/date-time-picker/date-time-picker.component';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { CarSummaryComponent } from '../car-summary/car-summary.component';
import { PersonalInfoComponent } from '../personal-info/personal-info.component';
import { LocationComponent } from '../location/location.component';
import { DatesComponent } from '../dates/dates.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../services/car.service';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-checkout',
  imports: [PersonalInfoComponent, LocationComponent, DatesComponent,CarSummaryComponent, AlreadyBookedComponent,DateTimePickerComponent, NgIf, HeaderComponent, FooterComponent, CommonModule, NotificationComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  constructor(private route:ActivatedRoute, private carinfo: CarService, private router:Router){}
   isLoading = true;
  carid:string='';
  carDetails:any;
  currentuser:any;
  blockedDates:string[]=[];
  user:{username: string, email: string}|undefined;
  ngOnInit(){
     // Set loading to true at the start
  this.isLoading = true;
  
  this.route.params.subscribe((params) => {
    this.carid = params['carid'];
    
    // Use forkJoin to combine multiple observables
    forkJoin({
      blockedDates: this.carinfo.getCarBookedDays(this.carid),
      carDetails: this.carinfo.getCarDetails(this.carid)
    }).pipe(
      finalize(() => {
        // Small delay to prevent flashing
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      })
    ).subscribe({
      next: (results) => {
        this.blockedDates = results.blockedDates.content;
        this.carDetails = results.carDetails;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
      }
    });
  });
  
  // Get user from session storage
  this.currentuser = JSON.parse(sessionStorage.getItem('user') as string);
  if (!this.currentuser) {
    this.router.navigate([`/auth/sign-in`]);
  }
  this.user = {username: this.currentuser.username, email: this.currentuser.email};
  
    this.route.queryParams.subscribe(params => {
    if (params['pickupDate']) {
      this.dateTime.pickup = new Date(params['pickupDate']);
    }
    
    if (params['dropoffDate']) {
      this.dateTime.dropoff = new Date(params['dropoffDate']);
    }
    
    if (params['pickupLocation']) {
      this.locationids.pickupid = params['pickupLocation'];
    }
    
    if (params['dropoffLocation']) {
      this.locationids.dropoffid = params['dropoffLocation'];
    }
  });
  }
  
  isPickupVisible=false;
  alreadybooked=false;

  pickerStatus(open:boolean){
    this.isPickupVisible=open;
  }

  bookStatus(status:boolean){
    this.alreadybooked=status;
  }

  dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };

  selectedDates(dates:{pickup: Date, dropoff: Date}){
    const pickup=dates.pickup;
    const dropoff=dates.dropoff;
    this.dateTime={pickup,dropoff}
  }

  locationids:{
    pickupid: string, dropoffid: string
  } ={pickupid: '', dropoffid: ''};

  selectedLocationIds(locationids:{
    pickupid: string, dropoffid: string
  }){
    this.locationids.pickupid=locationids.pickupid;
    this.locationids.dropoffid=locationids.dropoffid;
  }
  alert:string=''
  message:string=''
  success:boolean=false;
  showalert=false;
  buttons=false;
  handleAlert(sentalert:{alert:string,message:string,success:boolean}){
    this.alert=sentalert.alert;
    this.message=sentalert.message;
    this.success=sentalert.success;
    this.showalert=true;
    setTimeout(() => {
      this.showalert=false;
    }, 4000);
  }
  supportClient:{userId:string, userName:string}={
    userId: '',
    userName: ''
  };

  handlesupportclient(client:{userId:string, userName:string}){
    this.supportClient=client;
  }
  
}