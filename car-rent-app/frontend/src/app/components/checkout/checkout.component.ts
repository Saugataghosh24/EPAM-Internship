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
import { CarService } from '../../services/car-brief-info.service';
import { CarDetailsResponseBody } from '../../models/CarDetails.models';

@Component({
  selector: 'app-checkout',
  imports: [PersonalInfoComponent, LocationComponent, DatesComponent,CarSummaryComponent, AlreadyBookedComponent,DateTimePickerComponent, NgIf, HeaderComponent, FooterComponent, CommonModule, ButtonComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  constructor(private route:ActivatedRoute, private carinfo: CarService, private router:Router){}
  carid:string='';
  carDetails:CarDetailsResponseBody|undefined;
  currentuser:any;
  user:{username: string, email: string}|undefined;
  ngOnInit(){
    this.route.params.subscribe((params)=>{
      this.carid=params['carid'];
      console.log(this.carid)
    })

    this.carinfo.getCarDetails(this.carid).subscribe((details)=>{
      this.carDetails=details;
    })

    this.currentuser=JSON.parse(sessionStorage.getItem('user') as string);
    if(!this.currentuser){
      this.router.navigate([`/auth/sign-in`])
    }
    this.user={username: this.currentuser.username, email: this.currentuser.email}
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

  dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };

  selectedDates(dates:{pickup: Date, dropoff: Date}){
    const pickup=dates.pickup;
    const dropoff=dates.dropoff;
    this.dateTime={pickup,dropoff}
    // console.log(dates);
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
  
}