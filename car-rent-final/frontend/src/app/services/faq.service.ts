import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { FAQStoryResponse } from '../models/FAQStory.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  constructor(private http: HttpClient) { }
  private baseUrl = environment.apiBaseUrl;
  private faqStory$: Observable<FAQStoryResponse> | null = null;
  
  getFAQStory(): Observable<FAQStoryResponse> {
    if (!this.faqStory$) {
      this.faqStory$ = this.http.get<FAQStoryResponse>(`${this.baseUrl}home/faq`).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('FAQ error:', error);
          this.faqStory$ = null;
          return throwError(() => error);
        })
      );
    }
    return this.faqStory$;
  }
}