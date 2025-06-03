import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-time-picker',
  imports: [FormsModule,CommonModule],
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.css'
})
export class DateTimePickerComponent implements OnInit {

  @Input() blockedRanges: { start: string; end: string }[] = [];
  @Output() dateRangeSelected = new EventEmitter<{ pickup: Date, dropoff: Date }>();
  @Output() closed = new EventEmitter<boolean>();
  calendarMonths: Date[] = [];
  selectedPickup: Date | null = null;
  selectedDropoff: Date | null = null;
  pickupTime = '07:00';
  dropoffTime = '10:30';
  today = new Date();
  currentMonthIndex = 0;


  
  selectedPickupDate: Date | null = null;
  selectedDropoffDate: Date | null = null;


  ngOnInit(): void {
    const base = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.calendarMonths = [0, 1].map(i => {
      const month = new Date(base);
      month.setMonth(base.getMonth() + i);
      return month;
    });
    this.updateCalendarMonths();

    

    
  }
  updateCalendarMonths() {
    const base = new Date(this.today.getFullYear(), this.today.getMonth() + this.currentMonthIndex, 1);
    this.calendarMonths = [0, 1].map(i => {
      const month = new Date(base);
      month.setMonth(base.getMonth() + i);
      return new Date(month);
    });
  }
  goToNextMonth() {
    this.currentMonthIndex++;
    this.updateCalendarMonths();
  }
  goToPrevMonth() {
    this.currentMonthIndex--;
    this.updateCalendarMonths();
  }
  

  getDaysInMonth(month: Date): Date[] {
    const year = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(year, m, 1).getDay();
    const lastDay = new Date(year, m + 1, 0).getDate();
    const days: Date[] = [];

    for (let i = 0; i < first; i++) days.push(null as any); // placeholders

    for (let d = 1; d <= lastDay; d++) {
      days.push(new Date(year, m, d));
    }

    return days;
  }

  isPast(date: Date): boolean {
    const cmp = new Date();
    cmp.setHours(0, 0, 0, 0);
    return date < cmp;
  }

  isBlocked(date: Date): boolean {
    return this.blockedRanges.some(({ start, end }) => {
      const s = new Date(start);
      const e = new Date(end);
      return date >= s && date <= e;
    });
  }

  isRangeConflict(start: Date, end: Date): boolean {
    return this.blockedRanges.some(({ start: s, end: e }) => {
      const blockStart = new Date(s);
      const blockEnd = new Date(e);
      return start <= blockEnd && end >= blockStart;
    });
  }

  isInRange(date: Date): boolean {
    if (!this.selectedPickup || !this.selectedDropoff) return false;
  
    const d = new Date(date.setHours(0, 0, 0, 0));
    const start = new Date(this.selectedPickup.setHours(0, 0, 0, 0));
    const end = new Date(this.selectedDropoff.setHours(0, 0, 0, 0));
  
    return d > start && d < end;
  }

  isSelected(date: Date): boolean {
    return this.selectedPickup?.toDateString() === date.toDateString() ||
           this.selectedDropoff?.toDateString() === date.toDateString();
  }

  onSelectDate(date: Date): void {
    if (this.isPast(date) || this.isBlocked(date)) return;

    if (!this.selectedPickupDate || (this.selectedPickupDate && this.selectedDropoffDate)) {
      this.selectedPickupDate = date;
      this.selectedDropoffDate = null;
    } else {
      this.selectedDropoffDate = date;
    }

    if (!this.selectedPickupDate || (this.selectedPickupDate && this.selectedDropoffDate)) {
      this.selectedPickupDate = date;
      this.selectedDropoffDate = null;
    } else {
      this.selectedDropoffDate = date;
    }

    if (!this.selectedPickup || (this.selectedPickup && this.selectedDropoff)) {
      this.selectedPickup = date;
      this.selectedDropoff = null;
    } else {
      if (date < this.selectedPickup) {
        this.selectedPickup = date;
        this.selectedDropoff = null;
      } else {
        if (this.isRangeConflict(this.selectedPickup, date)) {
          return;
        }
        this.selectedDropoff = date;
        this.emitSelected();
      }
    }
  }

  emitSelected(): void {
    if (this.selectedPickup && this.selectedDropoff) {
      const pickup = new Date(this.selectedPickup);
      const dropoff = new Date(this.selectedDropoff);
      const [ph, pm] = this.pickupTime.split(':').map(Number);
      const [dh, dm] = this.dropoffTime.split(':').map(Number);
      // const pickup = new Date(this.selectedPickup);
      pickup.setHours(ph, pm);
      // const dropoff = new Date(this.selectedDropoff);
      dropoff.setHours(dh, dm);
      this.dateRangeSelected.emit({ pickup, dropoff });
      this.closed.emit(false);
    }
  }

  closePicker(): void {
    this.closed.emit(false);
  }


  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

}