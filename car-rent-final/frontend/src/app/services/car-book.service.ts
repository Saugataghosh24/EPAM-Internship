import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookCar } from '../models/BookCar.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CarBookService {

  constructor(private http:HttpClient) { }

  private jsonServerUrl = 'http://localhost:3000/BookCar';

  private baseUrl = environment.apiBaseUrl;

  getBookedCars():Observable<BookCar[]>{
    return this.http.get<BookCar[]>(this.jsonServerUrl);
  }

  addNewBooking(carDetails:any){
    return this.http.post<any>(`${this.baseUrl}/bookings`,carDetails);
  }

  getCarById(id:string){
    return this.http.get<any>(`${this.baseUrl}/cars/${id}`);
  }

  getAllCars(){
    return this.http.get<any>(`${this.baseUrl}/cars`)
  }
}
