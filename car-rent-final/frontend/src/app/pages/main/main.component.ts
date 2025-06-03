import { Component } from '@angular/core';
import { CarSearchComponent } from "../../components/car-search/car-search.component";
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";

@Component({
  selector: 'app-main',
  imports: [CarSearchComponent, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
