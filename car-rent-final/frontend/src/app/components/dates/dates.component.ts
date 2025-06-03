import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-dates',
  imports: [CommonModule, NgIf],
  templateUrl: './dates.component.html',
  styleUrl: './dates.component.css'
})
export class DatesComponent {

  @Input() dateTime: { pickup: Date, dropoff: Date } = {
    pickup: new Date(),
    dropoff: new Date()
  };

  cuser=JSON.parse(sessionStorage.getItem('user') as string);

  @Output() pickerOpen = new EventEmitter<boolean>();
  support=false;
  changedate=false;

  ngOnInit(){
    if(this.cuser.role==='Support'){
      this.support=true;
      this.changedate=true;
    }
  }
  
  openPickup() {
    this.pickerOpen.emit(true);
  }
}
