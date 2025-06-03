import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError  } from 'rxjs';
import { BookingInfo, Bookings, UserBookings } from '../models/BookingInfo.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private jsonServerUrl = 'http://localhost:3000'; // Adjust if your JSON Server runs on a different port
  private baseUrl=environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getAllBookings(){
    return this.http.get<any>(`${this.baseUrl}bookings`);
  }

  getBookingById(bookingid:string){
    return this.http.get<any>(`${this.baseUrl}bookings/${bookingid}/details`);
  }

  getUserBookings(userId: string){
      return this.http.get<any>(`${this.baseUrl}my-bookings/${userId}`)
      .pipe(
        map(response => {
          const userBookingsArray = Array.isArray(response) ? response : response.content;
          // console.log(userBookingsArray)
          if (!userBookingsArray) {
            console.error('Unexpected response structure:', response);
            return [];
          }
          return userBookingsArray;
        }),
        catchError(error => {
          console.error('Error in getUserBookings:', error);
          return throwError(() => error);
        })
      );
  }

  addBooking(bookingdetails: any){
   return this.http.post<any>(`${this.baseUrl}bookings`,bookingdetails);
  }

  updateBooking(id:string, user:UserBookings):Observable<UserBookings>{
    return this.http.put<UserBookings>(`${this.jsonServerUrl}/UserBookingInfo/${id}`,user);
  }
  
  updateLocation(bookingid:string,updates:{locationId: string}){
    return this.http.put<any>(`${this.baseUrl}bookings/${bookingid}/change-location`,updates);
  }

  updateDateTime(bookingid:string,updates:{pickupDateTime:string, dropOffDateTime:string}){
    return this.http.put<any>(`${this.baseUrl}bookings/${bookingid}/modify-dates`,updates);
  }

  cancelBooking(bookingid:string,status:string){
    return this.http.put<any>(`${this.baseUrl}bookings/${bookingid}/cancel`,status);
  }

  startService(bookingid:string,update:{startMilage:Number}){
    return this.http.put<any>(`${this.baseUrl}bookings/${bookingid}/start-service`,update);
  }

  endService(bookingid:string,update:{endMilage:Number}){
    return this.http.put<any>(`${this.baseUrl}bookings/${bookingid}/end-service`,update);
  }

  
}
