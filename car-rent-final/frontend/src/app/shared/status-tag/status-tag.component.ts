import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-tag',
  imports: [CommonModule],
  templateUrl: './status-tag.component.html',
  styleUrl: './status-tag.component.css'
})
export class StatusTagComponent {
  @Input() status: 'available' | 'service_provided' | 'not_available' | 'cancelled' | 'booking_finished' | 'reserved' | 'reserved_by_sa' | 'service_started' = 'available';

  get statusClass(): string {
    switch (this.status) {
      case 'not_available':
      case 'cancelled':
        return 'red';
      case 'booking_finished':
        return 'orange';
      case 'reserved':
      case 'reserved_by_sa':
          return 'green';
      case 'service_started':
        return 'blue';
      default:
        return 'black';
    }
  }

  get formattedStatus(): string {
    if (this.status === 'reserved_by_sa') return 'Reserved by SA';
    const words = this.status.replace(/_/g, ' ').toLowerCase().split(' ');
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ');
  }
}
