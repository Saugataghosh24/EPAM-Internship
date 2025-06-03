import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeedbackInfo } from '../models/FeedbackInfo.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private http: HttpClient) { }
  private baseUrl = 'http://localhost:3000/FeedbackInfo';
  getFeedbackInfo(): Observable<FeedbackInfo[]>{
    return this.http.get<FeedbackInfo[]>(this.baseUrl);
  }
}