// personal-info.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PersonalInfo {
  id: string;
  clientId: string;
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

@Injectable({
  providedIn: 'root'
})
export class PersonalInfoService {
  private apiUrl = 'http://localhost:3000/PersonalInfo';

  constructor(private http: HttpClient) {}

  getPersonalInfoById(id: string): Observable<PersonalInfo> {
    return this.http.get<PersonalInfo>(`${this.apiUrl}/${id}`);
  }

  updatePersonalInfo(personalInfo: PersonalInfo): Observable<PersonalInfo> {
    return this.http.put<PersonalInfo>(`${this.apiUrl}/${personalInfo.id}`, personalInfo);
  }
}