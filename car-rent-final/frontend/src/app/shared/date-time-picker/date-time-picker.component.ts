import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: 'app-date-time-picker',
  imports: [FormsModule, CommonModule, ButtonComponent],
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.css']
})
export class DateTimePickerComponent implements OnInit {
  @Input() allowPastDates = false;
  @Input() blockedRanges: string[] = [];
  @Input() allowTimeSelection= true;
  @Input() allowSameDaySelection = true; 
  @Input() selectedPickup: Date|null=null;
  @Input() selectedDropoff:Date|null=null;
  @Output() dateRangeSelected = new EventEmitter<{ pickup: Date; dropoff: Date }>();
  @Output() closed = new EventEmitter<boolean>();

  calendarMonths: Date[] = [];
  errorMessage: string | null = null;
  pickupTime = '00:00';
  dropoffTime = '12:00';
  today = new Date();
  currentMonthIndex = 0;

  ngOnInit(): void {
    const base = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.calendarMonths = [0, 1].map(i => {
      const month = new Date(base);
      month.setMonth(base.getMonth() + i);
      return month;
    });
    this.updateCalendarMonths();

    if (this.allowTimeSelection) {
      // Round 'pickupTime' to next 30 minutes from now
      const now = new Date();
      this.pickupTime = this.selectedPickup?.toTimeString().slice(0,5)||this.roundUpToNext30Minutes(now);
      
      // Set 'dropoffTime' to 30 minutes after 'pickupTime'
      const dropoffTime = this.selectedDropoff ? this.selectedDropoff : new Date(now);
      // dropoffTime.setMinutes(dropoffTime.getMinutes() + 420);
      this.dropoffTime = dropoffTime.toTimeString().slice(0,5);;
    } else {
      // If time selection is disabled, set times to 00:00
      this.pickupTime = '00:00';
      this.dropoffTime = '00:00';
    }
    this.validateInitialDates();
  }
  validateInitialDates(): void {
    // Check if both dates are provided
    if (this.selectedPickup && this.selectedDropoff) {
      // Check if pickup date is blocked
      if (this.isBlocked(this.selectedPickup)) {
        this.errorMessage = "Selected pickup date is not available. Please select a different date.";
        return;
      }
      
      // Check if dropoff date is blocked
      if (this.isBlocked(this.selectedDropoff)) {
        this.errorMessage = "Selected dropoff date is not available. Please select a different date.";
        return;
      }
      
      // Check if any date in the range is blocked
      if (this.isRangeConflict(this.selectedPickup, this.selectedDropoff)) {
        this.errorMessage = "Your selected date range includes unavailable dates. Please select different dates.";
        return;
      }
      
      // Check if the dates respect the same day selection setting
      const isSameDay = this.selectedPickup.toDateString() === this.selectedDropoff.toDateString();
      if (isSameDay && !this.allowSameDaySelection) {
        this.errorMessage = "Pickup and dropoff must be on different days.";
        return;
      }
      
      // Check if the pickup date is in the past (if past dates aren't allowed)
      if (!this.allowPastDates && this.selectedPickup < this.today) {
        this.errorMessage = "Pickup date cannot be in the past.";
        return;
      }
      
      // Perform time validation if time selection is allowed
      if (this.allowTimeSelection) {
        const validation = this.isTimeSelectionValid();
        if (!validation.valid) {
          this.errorMessage = validation.message;
          return;
        }
      }
    }
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
    if (this.currentMonthIndex > 0 || this.allowPastDates) {
      this.currentMonthIndex--;
      this.updateCalendarMonths();
    }
  }

  getDaysInMonth(month: Date): Date[] {
    const year = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(year, m, 1).getDay();
    const lastDay = new Date(year, m + 1, 0).getDate();
    const days: Date[] = [];

    for (let i = 0; i < first; i++) days.push(null as any);

    for (let d = 1; d <= lastDay; d++) {
      days.push(new Date(year, m, d));
    }

    return days;
  }

  // More reliable method to check if date or date+time is in the past
  isPast(date: Date, time?: string): boolean {
    if (!date || this.allowPastDates) {
      return false;
    }

    const now = new Date();
    const compareDate = new Date(date);
    
    // If time is provided, set that specific time
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      compareDate.setHours(hours, minutes, 0, 0);
    } else {
      // If no time, compare whole days
      compareDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
    }
    
    return compareDate < now;
  }

  // Helper to check if a specific time is in the past for today's date
  isTimeInPastForToday(time: string): boolean {
    if (this.allowPastDates) return false;
    
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const compareTime = new Date(now);
    compareTime.setHours(hours, minutes, 0, 0);
    
    return compareTime < now;
  }

  // Validate time for selected date
  validateTime(dateObj: Date | null, time: string): boolean {
    if (!dateObj) return false;
    
    // If it's today, time must not be in the past
    if (dateObj.toDateString() === this.today.toDateString()) {
      return this.isTimeInPastForToday(time);
    }
    
    return false;
  }

  // Ensure dropoff time is after pickup time when dates are the same
  validateDropoffTime(): void {
    if (!this.selectedPickup || !this.selectedDropoff) return;
    
    // Check if dates are the same
    if (this.selectedPickup.toDateString() === this.selectedDropoff.toDateString()) {
      const [ph, pm] = this.pickupTime.split(':').map(Number);
      const [dh, dm] = this.dropoffTime.split(':').map(Number);
      
      // If dropoff time is earlier or same as pickup time
      if (dh < ph || (dh === ph && dm <= pm)) {
        // Set dropoff time to 30 minutes after pickup time
        const newDropoffDate = new Date(this.selectedPickup);
        newDropoffDate.setHours(ph, pm + 30, 0, 0);
        this.dropoffTime = newDropoffDate.toTimeString().slice(0, 5);
      }
    }
    
    // If today is selected as pickup, ensure pickup time is not in past
    if (this.selectedPickup.toDateString() === this.today.toDateString()) {
      if (this.isTimeInPastForToday(this.pickupTime)) {
        // Reset to current time rounded to next 30 mins
        this.pickupTime = this.roundUpToNext30Minutes(new Date());
        // Then validate dropoff time again
        this.validateDropoffTime();
      }
    }
  }

  isBlocked(date: Date): boolean {
    // Format the date to match YYYY-MM-DD format in the blockedRanges array
    const formattedDate = this.formatDateToString(date);
    return this.blockedRanges.includes(formattedDate);
  }
  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    // Month is 0-indexed, so add 1 and ensure 2 digits
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // Ensure day is 2 digits
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  isRangeConflict(start: Date, end: Date): boolean {
    // Create a copy of start date to avoid modifying the original
    const current = new Date(start);
    current.setDate(current.getDate() + 1); // Start checking from the day after pickup
    
    // Check each day in the range (excluding start date itself)
    while (current < end) {
      if (this.isBlocked(current)) {
        return true; // Conflict found
      }
      // Move to next day
      current.setDate(current.getDate() + 1);
    }
    
    // Also check the end date itself
    return this.isBlocked(end);
  }

  // Fixed to avoid side effects
  isSelected(date: Date): boolean {
    // Create new date objects for comparison to prevent side effects
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const pickup = this.selectedPickup ? 
      new Date(this.selectedPickup.getFullYear(), this.selectedPickup.getMonth(), this.selectedPickup.getDate()) : null;
    const dropoff = this.selectedDropoff ? 
      new Date(this.selectedDropoff.getFullYear(), this.selectedDropoff.getMonth(), this.selectedDropoff.getDate()) : null;
    
    return (pickup !== null && dateToCheck.getTime() === pickup.getTime()) || 
           (dropoff !== null && dateToCheck.getTime() === dropoff.getTime());
  }

  // Fixed to avoid side effects
  isInRange(date: Date): boolean {
    if (!this.selectedPickup || !this.selectedDropoff) return false;

    // Create clean copies for comparison
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const pickup = new Date(this.selectedPickup.getFullYear(), this.selectedPickup.getMonth(), this.selectedPickup.getDate());
    const dropoff = new Date(this.selectedDropoff.getFullYear(), this.selectedDropoff.getMonth(), this.selectedDropoff.getDate());

    return dateToCheck > pickup && dateToCheck < dropoff;
  }

  onSelectDate(date: Date): void {
    // Skip if date is past (and not allowed) or is blocked
    if ((this.isPast(date) && !this.allowPastDates) || this.isBlocked(date)) return;

    // Case 1: No pickup date or both dates are already selected
    if (!this.selectedPickup || (this.selectedPickup && this.selectedDropoff)) {
      this.selectedPickup = new Date(date);
      this.selectedDropoff = null;
      
      // If selecting today, update pickup time (only if time selection is allowed)
      if (date.toDateString() === this.today.toDateString() && this.allowTimeSelection) {
        this.pickupTime = this.roundUpToNext30Minutes(new Date());
      }
    } 
    // Case 2: Pickup date is selected, selecting dropoff date
    else {
      // Case 2a: Selected date is before current pickup - change it to be the new pickup
      if (date < this.selectedPickup) {
        this.selectedPickup = new Date(date);
        this.selectedDropoff = null;
      } 
      // Case 2b: Selected date is after pickup
      else {
        // Check if there's a blocked date in the range
        if (this.isRangeConflict(this.selectedPickup, date)) {
          // NEW BEHAVIOR: Instead of blocking, make this the new pickup date
          this.selectedPickup = new Date(date);
          this.selectedDropoff = null;
          // Show a helpful message
          this.errorMessage = "Selected range contained unavailable dates. Select another date.";
          return;
        }
        
        // Check if same day selection is allowed
        const isSameDay = date.toDateString() === this.selectedPickup.toDateString();
        if (isSameDay && !this.allowSameDaySelection) {
          this.errorMessage = "Pickup and dropoff must be on different days";
          return;
        }
        
        // All good - set as dropoff date
        this.selectedDropoff = new Date(date);
        
        // Only validate times if time selection is allowed
        if (this.allowTimeSelection) {
          this.onTimeChange();
        }
      }
    }
    
    // Clear error messages when dates change (unless we just set one)
    if (this.errorMessage !== "Selected range contained unavailable dates. This date is now your new pickup date.") {
      this.errorMessage = null;
    }
  }
  isTimeSelectionValid(): { valid: boolean, message: string | null } {
    if (!this.selectedPickup || !this.selectedDropoff) {
      return { valid: false, message: "Please select both pickup and dropoff dates" };
    }
    // Check if pickup date is blocked
    if (this.isBlocked(this.selectedPickup)) {
      return { valid: false, message: "Selected pickup date is not available. Please select a different date." };
    }
    
    // Check if dropoff date is blocked
    if (this.isBlocked(this.selectedDropoff)) {
      return { valid: false, message: "Selected dropoff date is not available. Please select a different date." };
    }
    
    // Check if any date in the range is blocked
    if (this.isRangeConflict(this.selectedPickup, this.selectedDropoff)) {
      return { valid: false, message: "Your selected date range includes unavailable dates. Please select different dates." };
    }
    
    // Create date objects with times for validation
    const pickup = new Date(this.selectedPickup);
    const now = new Date();
    const dropoff = new Date(this.selectedDropoff);
    
    // Set hours based on whether time selection is allowed
    if (this.allowTimeSelection) {
      const [ph, pm] = this.pickupTime.split(':').map(Number);
      const [dh, dm] = this.dropoffTime.split(':').map(Number);
      
      pickup.setHours(ph, pm, 0, 0);
      dropoff.setHours(dh, dm, 0, 0);
    } else {
      // If time selection is not allowed, set to 00:00:00
      pickup.setHours(0, 0, 0, 0);
      dropoff.setHours(0, 0, 0, 0);
    }
    
    // Only validate against past times if allowPastDates is false
    if (!this.allowPastDates && pickup < now) {
      return { valid: false, message: "Pickup time must be in the future" };
    }
    
    // Check if same day selection is allowed
    const isSameDay = pickup.toDateString() === dropoff.toDateString();
    if (isSameDay && !this.allowSameDaySelection) {
      return { valid: false, message: "Pickup and dropoff must be on different days" };
    }
    
    // Always ensure dropoff is after pickup
    if (dropoff <= pickup) {
      return { valid: false, message: "Drop-off time must be after pickup time" };
    }
    
    return { valid: true, message: null };
  }
  onTimeChange(): void {
    if (this.allowTimeSelection) {
      const validation = this.isTimeSelectionValid();
      this.errorMessage = validation.message;
    }
  }
  roundUpToNext30Minutes(date: Date): string {
    const minutes = date.getMinutes();
    const hours = date.getHours();
    let roundedMinutes = Math.ceil(minutes / 30) * 30;
    
    // Handle case where rounding pushes to next hour
    if (roundedMinutes === 60) {
      roundedMinutes = 0;
      date.setHours(hours + 1);
    } else {
      date.setMinutes(roundedMinutes);
    }
    
    date.setSeconds(0, 0);
    return date.toTimeString().slice(0, 5);
  }

  emitSelected(): void {
    if (this.selectedPickup && this.selectedDropoff) {
      // Create clean copies to avoid side effects
      const pickup = new Date(this.selectedPickup);
      const dropoff = new Date(this.selectedDropoff);
      
      const [ph, pm] = this.pickupTime.split(':').map(Number);
      const [dh, dm] = this.dropoffTime.split(':').map(Number);
      
      pickup.setHours(ph, pm, 0, 0);
      dropoff.setHours(dh, dm, 0, 0);
      
      // Final validation to ensure dropoff is after pickup
      if (dropoff <= pickup) {
        dropoff.setMinutes(pickup.getMinutes() + 30);
        this.dropoffTime = dropoff.toTimeString().slice(0, 5);
      }
      this.dateRangeSelected.emit({ pickup, dropoff });
      this.closed.emit(false);
    }
  }
  correctDropoffTime(): void {
    if (!this.selectedPickup || !this.selectedDropoff || !this.allowTimeSelection) return;
    
    const [ph, pm] = this.pickupTime.split(':').map(Number);
    
    // Set dropoff time to 30 minutes after pickup time
    const newDropoffDate = new Date(this.selectedPickup);
    newDropoffDate.setHours(ph, pm + 30, 0, 0);
    this.dropoffTime = newDropoffDate.toTimeString().slice(0, 5);
    
    // Clear error message after correction
    this.errorMessage = null;
  }

  // Updated to respect settings
  validateAndEmit(): void {
    const validation = this.isTimeSelectionValid();
    
    if (!validation.valid) {
      this.errorMessage = validation.message;
      return;
    }
    
    // If all validations pass, emit the selected dates
    const pickup = new Date(this.selectedPickup!);
    const dropoff = new Date(this.selectedDropoff!);
    
    if (this.allowTimeSelection) {
      const [ph, pm] = this.pickupTime.split(':').map(Number);
      const [dh, dm] = this.dropoffTime.split(':').map(Number);
      
      pickup.setHours(ph, pm, 0, 0);
      dropoff.setHours(dh, dm, 0, 0);
    } else {
      // If time selection is disabled, set both to 00:00:00
      pickup.setHours(0, 0, 0, 0);
      dropoff.setHours(0, 0, 0, 0);
    }
    this.dateRangeSelected.emit({ pickup, dropoff });
    this.closed.emit(false);
  }

  closePicker(): void {
    this.closed.emit(false);
  }
}