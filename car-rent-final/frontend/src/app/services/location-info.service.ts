import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, shareReplay, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { LocationInfoResponse } from '../models/LocationInfo.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LocationInfoService {
  private baseUrl = environment.apiBaseUrl;
  private isBrowser: boolean;
  private locationCache$: Observable<LocationInfoResponse> | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getLocationInfo(): Observable<LocationInfoResponse> {
    if (!this.locationCache$) {
      this.locationCache$ = this.http.get<LocationInfoResponse>(`${this.baseUrl}home/locations`).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching locations:', error);
          this.locationCache$ = null;
          return throwError(() => error);
        })
      );
    }
    return this.locationCache$;
  }
  getlocations(){
    return this.http.get<any>(`${this.baseUrl}home/locations`)
  }
}