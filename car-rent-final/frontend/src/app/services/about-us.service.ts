import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { AboutUsStoryResponse } from '../models/AboutUsStoryInfo.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AboutUsService {
  constructor(private http: HttpClient) { }
  private baseUrl = environment.apiBaseUrl;
  private aboutUsStoryCache$: Observable<AboutUsStoryResponse> | null = null;
  
  getAboutUsStoryInfo(): Observable<AboutUsStoryResponse> {
    if (!this.aboutUsStoryCache$) {
      this.aboutUsStoryCache$ = this.http.get<AboutUsStoryResponse>(`${this.baseUrl}home/about-us`).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('About Us error:', error);
          this.aboutUsStoryCache$ = null;
          return throwError(() => error);
        })
      );
    }
    
    return this.aboutUsStoryCache$;
  }
}