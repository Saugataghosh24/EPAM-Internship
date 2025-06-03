import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import { ButtonComponent } from '../../../shared/button/button.component';
import { DateTimePickerComponent } from '../../../shared/date-time-picker/date-time-picker.component';
import { BookingsService } from '../../../services/bookings.service';
import { AuthService } from '../../../services/auth.service';
import { CarBookService } from '../../../services/car-book.service';
import { forkJoin } from 'rxjs';
import { BookingService } from '../../../services/booking-info.service';
import { HeaderComponent } from "../../../shared/header/header.component";
import { FooterComponent } from "../../../shared/footer/footer.component";
import { NotificationComponent } from "../../../shared/notification/notification.component";

@Component({
  selector: 'app-support-booking',
  imports: [FormsModule, NgFor, ButtonComponent, NgIf, DateTimePickerComponent, CommonModule, HeaderComponent, FooterComponent, NotificationComponent],
  templateUrl: './support-booking.component.html',
  styleUrl: './support-booking.component.css'
})
export class SupportBookingComponent {
  constructor(private router: Router, private bookingsService: BookingService, private authService: AuthService, private carBookService: CarBookService) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state !== undefined) {
      if (state['bookingupdate']) {
        this.alert = 'Congratulations!';
        this.message = state['bookingupdate'];
        this.status = true;
      } else {
        this.alert = state['alert'];
        this.message = state['message'];
        this.status = state['success'];
      }
      history.replaceState({}, '');
      this.bookingstate = true;
      setTimeout(() => {
        this.bookingstate = false;
      }, 10000);
    }
  }



  filters = {
    dateRange: {},
    madeBy: 'Any',
    status: 'Booking status'
  };
  pastDate = true;

  userType = ['Any', 'Client', 'Support Agent'];
  bookingStatuses = ['Booking status', 'Service provided', 'Booking finished', 'Service started', 'Reserved', 'Cancelled'];
  datepicker = false;
  allBookings: any[] = [];
  filteredBookings: any[] = [];
  alert: string = 'Congratulations'
  message: string = 'Booking was successfully created'
  success: boolean = true;
   status: boolean = false;
  bookingstate = false;
  loading = true;

  ngOnInit() {
    this.loading = true;

    this.bookingsService.getAllBookings().subscribe({
      next: (bookings) => {
        let fetchedBookings = bookings.content;
        let formatted = fetchedBookings.map((booking: any) => {
          return {
            bookingId: booking.bookingId,
            bookingNumber: booking.bookingNumber,
            BookingPeriod: booking.BookingPeriod,
            carModel: booking.carModel,
            clientName: booking.clientName,
            date: booking.date,
            location: booking.location,
            madeBy: booking.madeBy,
            bookingStatus: this.getBookingStatus(booking.bookingStatus)
          }
        })
        this.allBookings = [...formatted];
        this.filteredBookings = [...this.allBookings]
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error(err);
      }
    })
  }


  getBookingStatus(status: string): string {
    switch (status) {
      case 'RESERVED':
      case 'RESERVEDBYSUPPORTAGENT':
        return 'Reserved';
      case 'SERVICESTARTED':
        return 'Service started';
      case 'SERVICEPROVIDED':
        return 'Service provided';
      case 'BOOKINGFINISHED':
        return 'Booking finished';
      default:
        return 'Cancelled';
    }
  }

  applyFilters() {
    const now = new Date();
    if (this.dateTime.pickup === now) {
      this.dateTime.pickup.setMonth(now.getMonth() - 1);
    }
    this.filteredBookings = this.allBookings.filter((booking) => {
      const hasMadeByFilter = this.filters.madeBy && this.filters.madeBy !== 'Any';
      const hasStatusFilter = this.filters.status && this.filters.status !== 'Booking status';

      const madeByMatch = hasMadeByFilter
        ? booking.madeBy.toLowerCase() === this.filters.madeBy.toLowerCase()
        : true;

      const statusMatch = hasStatusFilter
        ? booking.bookingStatus.toLowerCase() === this.filters.status.toLowerCase()
        : true;

      const bookingDateParts = booking.date.split('.');
      const bookingDate = new Date(
        2000 + parseInt(bookingDateParts[2], 10), // YY to YYYY
        parseInt(bookingDateParts[1], 10) - 1,    // MM (0-based)
        parseInt(bookingDateParts[0], 10)         // DD
      );

      // const dateMatch = bookingDate >= startDate && bookingDate <= endDate;
      const startDate = new Date(this.dateTime.pickup);
      const endDate = new Date(this.dateTime.dropoff);

      // startDate.setHours(0, 0, 0, 0);
      // endDate.setHours(23, 59, 59, 999);

      const dateMatch = bookingDate >= startDate && bookingDate <= endDate;

      return madeByMatch && statusMatch && dateMatch;
    });
  }



  openMenuIndex: number | null = null;

  createBooking() {
    this.router.navigate(['/cars'])
  }

  toggleMenu(index: number) {
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  viewDetails(bookingid: string) {
    this.router.navigate([`/bookingmodification/${bookingid}`])
    this.openMenuIndex = null;
  }

  cancelBooking() {
    this.openMenuIndex = null;
  }

  togglePickup() {
    this.datepicker = !this.datepicker;
  }

  pickerStatus(open: boolean) {
    this.datepicker = open;
  }

  dateTime: { pickup: Date, dropoff: Date } = {
    pickup: (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return date;
    })(),
    dropoff: new Date()
  };


  selectedDates(dates: { pickup: Date, dropoff: Date }) {
    const pickup = dates.pickup;
    const dropoff = dates.dropoff;
    this.dateTime = { pickup, dropoff }
  }
}
