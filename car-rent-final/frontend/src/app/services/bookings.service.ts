import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {

  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiBaseUrl;

  getAllBookings() {
    return this.http.get<any>(`${this.baseUrl}bookings`);
  }
}