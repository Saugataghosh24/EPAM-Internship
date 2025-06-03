// active-button.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActiveButtonService {
  private activeButtonSource = new BehaviorSubject<string>('Home');
  currentActiveButton = this.activeButtonSource.asObservable();

  setActiveButton(buttonName: string) {
    this.activeButtonSource.next(buttonName);
  }
}