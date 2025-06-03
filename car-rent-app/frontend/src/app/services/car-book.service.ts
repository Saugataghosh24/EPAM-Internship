import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookCar } from '../models/BookCar.model';

@Injectable({
  providedIn: 'root'
})
export class CarBookService {

  constructor(private http:HttpClient) { }

  private jsonServerUrl = 'http://localhost:3000/BookCar';

  getBookedCars():Observable<BookCar[]>{
    return this.http.get<BookCar[]>(this.jsonServerUrl);
  }

  addNewBooking(carDetails:BookCar):Observable<BookCar>{
    return this.http.post<BookCar>(this.jsonServerUrl,carDetails);
  }
}
