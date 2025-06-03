import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-already-booked',
  imports: [ButtonComponent],
  templateUrl: './already-booked.component.html',
  styleUrl: './already-booked.component.css'
})
export class AlreadyBookedComponent {

  @Output() bookStatus = new EventEmitter<boolean>(false);

  closePopup() {
    this.bookStatus.emit(false);
  }
}
