import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { FeedbackInfoResponse,FeedbackRequest,FeedbackResponse } from '../models/FeedbackInfo.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private http: HttpClient) { }
  private baseUrl = environment.apiBaseUrl;
  private feedbackInfoCache$: Observable<FeedbackInfoResponse> | null = null;
  
  getFeedbackInfo(): Observable<FeedbackInfoResponse> {
    if (!this.feedbackInfoCache$) {
      this.feedbackInfoCache$ = this.http.get<FeedbackInfoResponse>(`${this.baseUrl}feedbacks/recent`).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Feedback error:', error);
          this.feedbackInfoCache$ = null;
          return throwError(() => error);
        })
      );
    }
    return this.feedbackInfoCache$;
  }
  postFeedback(feedbackRequest: FeedbackRequest): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(`${this.baseUrl}feedbacks`, feedbackRequest).pipe(
      catchError(error => {
        console.error('Error posting feedback:', error);
        return throwError(() => error);
      })
    );
  }
}