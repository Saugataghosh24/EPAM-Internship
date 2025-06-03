import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';
import { CarSearchComponent } from '../../components/car-search/car-search.component';
import { AboutUsComponent } from '../../components/about-us/about-us.component';
import { LocationsComponent } from '../../components/locations/locations.component';
import { FeedbackComponent } from '../../components/feedback/feedback.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { PopularCarsComponent } from '../../features/popular-cars/popular-cars.component';


@Component({
  selector: 'app-home',
  standalone:true,
  imports: [CommonModule,HeaderComponent,CarSearchComponent,AboutUsComponent,LocationsComponent, FeedbackComponent,FaqComponent,FooterComponent,PopularCarsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {

}
