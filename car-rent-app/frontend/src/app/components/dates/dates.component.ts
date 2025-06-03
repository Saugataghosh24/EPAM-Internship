import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dates',
  imports: [CommonModule],
  templateUrl: './dates.component.html',
  styleUrl: './dates.component.css'
})
export class DatesComponent {

  @Input() dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };

  @Output() pickerOpen = new EventEmitter<boolean>();
  
  openPickup() {
    this.pickerOpen.emit(true);
  }
}
