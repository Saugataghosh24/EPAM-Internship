// src/app/shared/components/rating/rating.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
  standalone : true,
  imports: [CommonModule]
})


export class RatingComponent implements OnChanges {
  @Input() rating = 0;
  @Input() readonly = false;
  @Input() showValue = false;
  @Input() allowHalfStars = false;
  @Output() ratingChange = new EventEmitter<number>();
  
  hoverRating = 0;
  stars = [1, 2, 3, 4, 5];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rating'] && !this.allowHalfStars) {
      // Round to nearest integer if half stars are not allowed
      this.rating = Math.round(this.rating);
    }
  }

  setHoverRating(star: number): void {
    if (!this.readonly) {
      this.hoverRating = star;
    }
  }

  resetHoverRating(): void {
    if (!this.readonly) {
      this.hoverRating = 0;
    }
  }

  setRating(star: number): void {
    if (!this.readonly) {
      // If clicking on the current rating, clear it (allows removing rating)
      if (this.rating === star) {
        this.rating = 0;
      } else {
        this.rating = star;
      }
      this.ratingChange.emit(this.rating);
    }
  }

  isActive(star: number): boolean {
    return star <= (this.hoverRating || this.rating);
  }
  
  isHalfStar(star: number): boolean {
    if (!this.allowHalfStars) return false;
    
    // No hover rating and the star is exactly 0.5 above an integer
    return this.hoverRating === 0 && 
           star === Math.ceil(this.rating) && 
           this.rating % 1 !== 0;
  }
}