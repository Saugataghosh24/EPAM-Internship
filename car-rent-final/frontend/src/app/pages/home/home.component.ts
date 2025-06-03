import {  Component } from '@angular/core';
import { CommonModule} from '@angular/common';
import { AboutUsComponent } from './about-us/about-us.component';
import { LocationsComponent } from './locations/locations.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { FaqComponent } from './faq/faq.component';
import { PopularCarsComponent } from './popular-cars/popular-cars.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone:true,
  imports: [CommonModule,AboutUsComponent,LocationsComponent, FeedbackComponent,FaqComponent,PopularCarsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {
  // alert: string = 'Congratulations'
  // message: string = 'Booking was successfully created'
  // success: boolean = false;
  // bookingstate = false;
  constructor( private router: Router) {
    // const state = this.router.getCurrentNavigation()?.extras.state;
    // // console.log("state", state)
    // if (state !== undefined) {
    //   this.alert = 'Congratulations!';
    //   this.message = state['message'];
    //   this.success = true;

    //   history.replaceState({}, '');
    //   this.bookingstate = true;
    //   setTimeout(() => {
    //     this.bookingstate = false;
    //   }, 10000);
    // }
  }
  ngOnInit(){
    
  }
}
