import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of  } from 'rxjs';
import { BookingInfo, UserBookings } from '../models/BookingInfo.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private jsonServerUrl = 'http://localhost:3000'; // Adjust if your JSON Server runs on a different port

  constructor(private http: HttpClient) { }

  getAllBookings():Observable<UserBookings[]>{
    return this.http.get<UserBookings[]>(`${this.jsonServerUrl}/UserBookingInfo`);
  }

  // Get bookings for a specific user
  getUserBookings(userId: string): Observable<BookingInfo[] | []> {
    // With JSON Server, we need to fetch the UserBookingInfo array
    return this.http.get<any>(`${this.jsonServerUrl}/UserBookingInfo`)
      .pipe(
        map(response => {
          // Check if response is an array (direct array response) or if it has a UserBookingInfo property
          const userBookingsArray = Array.isArray(response) ? response : response.UserBookingInfo;
          
          if (!userBookingsArray) {
            console.error('Unexpected response structure:', response);
            return [];
          }
          // Find the user with the matching userId
          return userBookingsArray.find((userBooking: UserBookings) => userBooking.userId === userId).bookings;
        }),
        catchError(error => {
          console.error('Error in getUserBookings:', error);
          return [];
        })
      );
  }

  addBooking(bookingdetails: UserBookings):Observable<UserBookings>{
   return this.http.post<UserBookings>(`${this.jsonServerUrl}/UserBookingInfo`,bookingdetails);
  }

  updateBooking(id:string, user:UserBookings):Observable<UserBookings>{
    return this.http.put<UserBookings>(`${this.jsonServerUrl}/UserBookingInfo/${id}`,user);
  }
  
}
