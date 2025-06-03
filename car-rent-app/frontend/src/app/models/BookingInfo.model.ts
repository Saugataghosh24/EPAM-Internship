export interface BookingInfo {
  bookingId: string;
  bookingStatus: 'reserved' | 'reserved-by-sa' | 'service-started' | 'service-provided' | 'booking-finished' | 'cancelled';
  carImageUrl: string;
  carModel: string;
  orderDetails: string;
}

export interface UserBookings {
  userId: string;
  userName?: string; // optional
  bookings: BookingInfo[];
}
