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

export interface Bookings {
  bookingId: string;
  userId: string;
  carModel: string;
  carImageUrl: string;
  carLocation: string;
  pricePerDay: string;
  clientName: string;
  dropoffDateTime: string;
  dropoffLocation: string;
  pickupDateTime: string;
  pickupLocation: string;
  orderNo: string;
  bookingStatus: string;
  madeBy: string;
  startMilage: number;
  endMilage: number;
  bookingDate: string;
  review?: string;
}
export interface BookingBrief {
  bookingId: string,
  bookingStatus: string,
  carId:string,
  carImageUrl:string,
  carModel:string,
  orderDetails:string,
  review?: string,
  rating?: number
}