import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AboutUsStoryInfo } from '../models/AboutUsStoryInfo.model';

@Injectable({
  providedIn: 'root'
})
export class AboutUsService {
  constructor(private http: HttpClient) { }
  private baseUrl = 'http://localhost:3000/AboutUsStoryInfo';
  getAboutUsStoryInfo(): Observable<AboutUsStoryInfo[]>{
    return this.http.get<AboutUsStoryInfo[]>(this.baseUrl);
  }
}
