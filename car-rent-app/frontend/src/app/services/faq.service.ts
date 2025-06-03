import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FAQStory } from '../models/FAQStory.model';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  constructor(private http: HttpClient) { }
  private baseUrl = 'http://localhost:3000/FAQStory';
  getFAQStory(): Observable<FAQStory[]>{
    return this.http.get<FAQStory[]>(this.baseUrl);
  }
}