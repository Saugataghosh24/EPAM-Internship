import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { CancelConfirmationComponent } from './cancel-confirmation/cancel-confirmation.component';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { BookingService } from '../../services/booking-info.service';
import { BookingInfo, UserBookings } from '../../models/BookingInfo.model';
import { finalize, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ActiveButtonService } from '../../services/active-button.service';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { isPlatformBrowser } from '@angular/common';

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
    NotificationComponent,
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css'],
})
export class ClientDashboardComponent implements OnInit {
  activeTab: string = 'all-bookings';
  userId: string;
  error: string | null = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  bookings: BookingInfo[] = [];
  feedback: Feedback[] = [];
  // Modal states
  showCancelConfirmation: boolean = false;
  showFeedbackForm: boolean = false;
  bookingToCancel: string | null = null;
  bookingForFeedback: BookingInfo | null = null;
  private subscriptions: Subscription = new Subscription();

  alert: string = '';
  message: string = '';
  status: boolean = false;
  bookingstate = false;
  updatemessage: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activeButtonService: ActiveButtonService,
    private bookingService: BookingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.userId = '';
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

  // loadBookings(): void {
  //   const subscription = this.bookingService.getBookingInfo()

  //   this.subscriptions.add(subscription);

  //   // Mock data - in a real app, this would come from a service
  //   // this.bookings = [
  //   //   {
  //   //     id: '1',
  //   //     carModel: 'Audi A6 Quattro',
  //   //     year: '2023',
  //   //     bookingStatus: 'reserved',
  //   //     orderNumber: '#2437',
  //   //     orderDate: '06.11.24',
  //   //     carImageUrl: 'assets/images/audi-a6.jpg'
  //   //   },
  //   //   {
  //   //     id: '2',
  //   //     carModel: 'Range Rover',
  //   //     year: '2019',
  //   //     bookingStatus: 'reserved-by-sa',
  //   //     orderNumber: '#2437',
  //   //     orderDate: '06.11.24',
  //   //     carImageUrl: 'assets/images/range-rover.jpg'
  //   //   },
  //   //   {
  //   //     id: '3',
  //   //     carModel: 'Porsche 911',
  //   //     year: '2021',
  //   //     bookingStatus: 'service-started',
  //   //     orderNumber: '#2437',
  //   //     orderDate: '06.11.24',
  //   //     carImageUrl: 'assets/images/porsche-911.jpg'
  //   //   },
  //   //   {
  //   //     id: '4',
  //   //     carModel: 'Nissan Z',
  //   //     year: '2024',
  //   //     bookingStatus: 'cancelled',
  //   //     orderNumber: '#2437',
  //   //     orderDate: '06.11.24',
  //   //     carImageUrl: 'assets/images/nissan-z.jpg'
  //   //   },
  //   //   {
  //   //     id: '5',
  //   //     carModel: 'Mercedes-Benz A class',
  //   //     year: '2019',
  //   //     bookingStatus: 'service-provided',
  //   //     orderNumber: '#3432',
  //   //     orderDate: '15.10.24',
  //   //     carImageUrl: 'assets/images/mercedes-a.jpg'
  //   //   },
  //   //   {
  //   //     id: '6',
  //   //     carModel: 'BMW 330i',
  //   //     year: '2020',
  //   //     bookingStatus: 'booking-finished',
  //   //     orderNumber: '#2437',
  //   //     orderDate: '06.11.24',
  //   //     carImageUrl: 'assets/images/bmw-330i.jpg'
  //   //   }
  //   // ];
  // }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // getFilteredBookings(): BookingInfo[] {
  //   if (this.activeTab === 'all-bookings') {
  //     return this.bookings;
  //   }
  //   return this.bookings.filter(
  //     (booking) =>
  //       booking.bookingStatus.toLowerCase().replace('-', '') ===
  //       this.activeTab.toLowerCase().replace('-', '')
  //   );
  // }
  getFilteredBookings(): BookingInfo[] {
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
      return normalizedStatus === normalizedTab;
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
      // In a real app, this would call a service to update the booking bookingStatus
      const booking = this.bookings.find(
        (b) => b.bookingId === this.bookingToCancel
      );
      if (booking) {
        booking.bookingStatus = 'cancelled';
      }
      this.closeCancelConfirmation();
    }
    this.bookingstate=true;
    this.alert="Congratulations";
    this.message="You have cancelled your booking successfully!";
    this.status=true;
    setTimeout(() => {
      this.bookingstate=false;
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
      const newFeedback: Feedback = {
        bookingId: this.bookingForFeedback.bookingId,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
      };

      // In a real app, you would send this to your backend API
      this.feedback.push(newFeedback);
      console.log('Feedback submitted:', newFeedback);

      // Update booking bookingStatus
      const booking = this.bookings.find(
        (b) => b.bookingId === this.bookingForFeedback?.bookingId
      );
      if (booking) {
        booking.bookingStatus = 'booking-finished';
      }

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
  viewFeedback(id: string): void {
    const bookingFeedback = this.feedback.find((f) => f.bookingId === id);
    if (bookingFeedback) {
      alert(
        `Rating: ${bookingFeedback.rating}/5\nComment: ${bookingFeedback.comment}`
      );
    } else {
      alert('No feedback available for this booking.');
    }
  }

  openSupportChat(): void {
    // In a real app, this would open a chat window
    alert('Opening support chat');
  }
}
