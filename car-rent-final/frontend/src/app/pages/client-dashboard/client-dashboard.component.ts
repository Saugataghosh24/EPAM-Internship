import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { CancelConfirmationComponent } from './cancel-confirmation/cancel-confirmation.component';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { BookingService } from '../../services/booking-info.service';
import { BookingBrief, BookingInfo, Bookings, UserBookings } from '../../models/BookingInfo.model';
import { finalize, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ActiveButtonService } from '../../services/active-button.service';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { isPlatformBrowser } from '@angular/common';
import { AboutUsComponent } from "../home/about-us/about-us.component";
import { FeedbackRequest } from '../../models/FeedbackInfo.model';
import { FeedbackService } from '../../services/feedback.service';

interface Feedback {
  bookingId: string;
  rating: number;
  comment: string;
}
@Component({
  selector: 'app-client-dashboard',
  imports: [
    CommonModule,
    CancelConfirmationComponent,
    FeedbackFormComponent,
    ButtonComponent,
    FooterComponent,
    HeaderComponent,
    NotificationComponent
],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css'],
})
export class ClientDashboardComponent implements OnInit {
  activeTab: string = 'all-bookings';
  userId: string='';
  error: string | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  bookings: any[] = [];
  feedback: FeedbackRequest[] = [];
  // Modal states
  showCancelConfirmation: boolean = false;
  showFeedbackForm: boolean = false;
  bookingToCancel: string | null = null;
  bookingForFeedback: BookingBrief | null = null;
  private subscriptions: Subscription = new Subscription();

  alert: string = '';
  message: string = '';
  status: boolean = false;
  bookingstate = false;
  updatemessage: string = '';
  showfeedback = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activeButtonService: ActiveButtonService,
    private bookingService: BookingService,
    private feedbackService: FeedbackService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
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

  ngOnInit(): void {
    this.activeButtonService.setActiveButton('My Bookings');
    // this.route.params.subscribe(params => {
    //   this.userId = params['id'];
    // });
    if (isPlatformBrowser(this.platformId)) {
      this.userId = JSON.parse(sessionStorage.getItem('user') as string).userId;
    }

    this.loadBookingDetails();
  }

  loadBookingDetails(): void {
    this.isLoading = true;
    this.error = null;

    this.bookingService.getUserBookings(this.userId).subscribe({
      next: (bookings) => {
        if (bookings) {
          this.bookings = bookings;
          console.log(bookings);
        } else {
          this.error = 'No bookings found for this user.';
          console.log(this.error);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.error = 'Failed to load bookings. Please try again later.';
        this.isLoading = false;
      },
    });
  }


  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }


  getFilteredBookings(): any[] {
    // console.log(this.bookings)
    if (!this.bookings) {
      return [];
    }

    if (this.activeTab === 'all-bookings') {
      return this.bookings;
    }

    return this.bookings.filter((booking) => {
      const normalizedStatus = booking.bookingStatus
        .toLowerCase()
        .replace(/-/g, '');
      const normalizedTab = this.activeTab.toLowerCase().replace(/-/g, '');
      return normalizedStatus.includes(normalizedTab);
    });
  }

  // Updated to show confirmation popup
  cancelBooking(id: string): void {
    this.bookingToCancel = id;
    this.showCancelConfirmation = true;

  }

  // New method to confirm cancellation

  // New method to confirm cancellation
  confirmCancelBooking(): void {
    if (this.bookingToCancel) {
      const booking = this.bookings.find(
        (b) => b.bookingId === this.bookingToCancel
      );
      booking.bookingStatus = 'CANCELLED';
      if (booking) {
        this.bookingService.cancelBooking(this.bookingToCancel, 'CANCELLED').subscribe((res) => {
        })
      }
      this.closeCancelConfirmation();
    }
    this.bookingstate = true;
    this.alert = "Congratulations";
    this.message = "You have cancelled your booking successfully!";
    this.status = true;
    setTimeout(() => {
      this.bookingstate = false;
    }, 10000);
  }



  // New method to close the confirmation popup
  closeCancelConfirmation(): void {
    this.showCancelConfirmation = false;
    this.bookingToCancel = null;
  }



  editBooking(id: string): void {
    // In a real app, this would navigate to an edit form or open a modal
    // alert(`Edit booking ${id}`);
    this.router.navigate(['/bookings', 'bookingmodification', id]);
  }

  // Feedback methods
  leaveFeedback(id: string): void {
    const booking = this.bookings.find((b) => b.bookingId === id);
    if (booking) {
      this.bookingForFeedback = booking;
      this.showFeedbackForm = true;
    }
  }

  submitFeedback(feedbackData: { rating: number; comment: string }): void {
    if (this.bookingForFeedback) {
      // Save feedback
      const newFeedback: FeedbackRequest = {
        bookingId: this.bookingForFeedback.bookingId,
        carId: this.bookingForFeedback.carId,
        clientId: this.userId,
        rating: feedbackData.rating,
        feedbackText: feedbackData.comment,
      };
      this.feedbackService.postFeedback(newFeedback).subscribe({
        next: (res) => {
          console.log("response",res);
          this.message = res.systemMessage!;
          this.alert = res.feedbackId!;
          this.status = true;
          setTimeout(() => {
            this.status = false;
          }, 10000);
        },
        error: (err) => {
          this.errorMessage = err.error.message;
          this.status = true;
          setTimeout(() => {
            this.status = false;
          }, 10000);
        },
      });

      // // In a real app, you would send this to your backend API
      // this.feedback.push(newFeedback);
      // console.log('Feedback submitted:', newFeedback);

      // // Update booking bookingStatus
      // const booking = this.bookings.find(
      //   (b) => b.bookingId === this.bookingForFeedback?.bookingId
      // );
      // if (booking) {
      //   booking.bookingStatus = 'booking-finished';
      // }

      this.closeFeedbackForm();
    }
  }
  getEmptyStateMessage(): string {
    if (this.activeTab === 'all-bookings') {
      return "You don't have any bookings yet.";
    } else {
      // Format the tab name by replacing hyphens with spaces
      const formattedTabName = this.activeTab.replace(/-/g, ' ');
      return `You don't have any ${formattedTabName} bookings.`;
    }
  }
  closeFeedbackForm(): void {
    this.showFeedbackForm = false;
    this.bookingForFeedback = null;
  }
  handleImageError(event: any): void {
    // Set the source to a placeholder image
    event.target.src =
      'https://static.foxdealer.com/489/2023/06/no-car-placeholder.png';
    // You can also log this error if needed
    console.warn('Image failed to load, using placeholder instead');
  }
  carModel = '';
  review = '';
  viewFeedback(carModel: string, review: string): void {
    this.showfeedback = true;
    this.carModel = carModel;
    this.review = review;
  }
  closefeedback() {
    this.showfeedback = false;
    this.carModel = '';
    this.review = '';
  }

  openSupportChat(): void {
    // In a real app, this would open a chat window
    alert('Opening support chat');
  }
}
