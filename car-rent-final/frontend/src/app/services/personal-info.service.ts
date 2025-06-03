// personal-info.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

export interface PersonalInfo {
  clientId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  postalCode: string;
  street: string;
  imageUrl: string;
}

export interface PersonalInfoUpdateRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  postalCode: string;
  street: string;
  avatar?: File; // For image upload
}

@Injectable({
  providedIn: 'root'
})
export class PersonalInfoService {
  private apiUrl = environment.apiBaseUrl+'/users'; // Base API URL

  constructor(private http: HttpClient) {}

  // Get personal info by user ID
  getPersonalInfoById(userId: string): Observable<PersonalInfo> {
    // Add authorization headers if needed
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get<PersonalInfo>(`${this.apiUrl}/${userId}/personal-info`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update personal info
  updatePersonalInfo(userId: string, personalInfo: PersonalInfoUpdateRequest): Observable<PersonalInfo> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    // Create FormData if we have an avatar file
    const formData = new FormData();
    
    // Add all personal info fields to the form data
    formData.append('firstName', personalInfo.firstName);
    formData.append('lastName', personalInfo.lastName);
    formData.append('phoneNumber', personalInfo.phoneNumber);
    formData.append('country', personalInfo.country);
    formData.append('city', personalInfo.city);
    formData.append('postalCode', personalInfo.postalCode);
    formData.append('street', personalInfo.street);
    
    // Add avatar if it exists
    if (personalInfo.avatar) {
      formData.append('avatar', personalInfo.avatar);
    }

    return this.http.put<PersonalInfo>(
      `${this.apiUrl}/${userId}/personal-info`, 
      formData,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Helper method to get auth token
  private getToken(): string {
    // Get token from sessionStorage or your auth service
    return sessionStorage.getItem('token') || '';
  }

  // Error handling
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || 'Something went wrong. Please try again later.';
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}