//html
<div class="relative flex gap-4 w-full ">
  <div class="relative w-1/2">
    <input title="date" 
      type="text"
      class="border p-2 rounded w-full cursor-pointer"
      [value]="pickupDisplay"
      readonly
      (click)="togglePicker()">
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-transform duration-200"
    [ngClass]="{'rotate-180': showPicker}" (click)="togglePicker()">
      <svg width="7" height="4" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.240779 0.376034C0.353279 0.263673 0.505779 0.200562 0.66478 0.200562C0.82378 0.200562 0.976279 0.263673 1.08878 0.376034L3.06478 2.35203L5.04078 0.376034C5.15452 0.27005 5.30496 0.212351 5.4604 0.215094C5.61584 0.217836 5.76415 0.280805 5.87408 0.390736C5.98401 0.500666 6.04698 0.648975 6.04972 0.804416C6.05246 0.959857 5.99476 1.11029 5.88878 1.22403L3.48878 3.62403C3.37628 3.73639 3.22378 3.79951 3.06478 3.79951C2.90578 3.79951 2.75328 3.73639 2.64078 3.62403L0.240779 1.22403C0.128419 1.11153 0.0653076 0.959034 0.0653076 0.800034C0.0653076 0.641033 0.128419 0.488534 0.240779 0.376034Z" fill="black"/>
      </svg>
    </span>
  </div>
  <div class="relative w-1/2">
    <input title="date" 
      type="text"
      class="border p-2 rounded w-full cursor-pointer"
      [value]="dropoffDisplay"
      readonly
      (click)="togglePicker()">
    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-transform duration-200"
    [ngClass]="{'rotate-180': showPicker}" (click)="togglePicker()">
      <svg width="7" height="4" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.240779 0.376034C0.353279 0.263673 0.505779 0.200562 0.66478 0.200562C0.82378 0.200562 0.976279 0.263673 1.08878 0.376034L3.06478 2.35203L5.04078 0.376034C5.15452 0.27005 5.30496 0.212351 5.4604 0.215094C5.61584 0.217836 5.76415 0.280805 5.87408 0.390736C5.98401 0.500666 6.04698 0.648975 6.04972 0.804416C6.05246 0.959857 5.99476 1.11029 5.88878 1.22403L3.48878 3.62403C3.37628 3.73639 3.22378 3.79951 3.06478 3.79951C2.90578 3.79951 2.75328 3.73639 2.64078 3.62403L0.240779 1.22403C0.128419 1.11153 0.0653076 0.959034 0.0653076 0.800034C0.0653076 0.641033 0.128419 0.488534 0.240779 0.376034Z" fill="black"/>
      </svg>
    </span>
  </div>
    <!-- Pop-up -->
    <div *ngIf="showPicker" class="absolute top-full z-50 mt-2 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded">
      <app-date-time-picker
        [blockedRanges]="blockedDates"
        (dateRangeSelected)="onDateSelected($event)"
        (closed)="showPicker = true"
      ></app-date-time-picker>
    </div>
</div>




//ts
pickupDisplay = '';
  dropoffDisplay = '';
  showPicker = false;
  blockedDates = [
    { start: '2025-04-26T00:00:00Z', end: '2025-04-27T23:59:00Z' },
    { start: '2024-12-17T00:00:00Z', end: '2024-12-19T23:59:00Z' }
  ];
  togglePicker(){
    this.showPicker = this.showPicker===false? true:false;
  }
  onDateSelected(event: { pickup: Date; dropoff: Date }) {
    this.pickupDisplay = this.formatDate(event.pickup);
    this.dropoffDisplay = this.formatDate(event.dropoff);
    this.showPicker = false;
  }
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }