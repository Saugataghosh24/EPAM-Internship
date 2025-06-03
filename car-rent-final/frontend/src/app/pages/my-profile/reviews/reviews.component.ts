// reviews.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReviewsService, Review } from '../../../services/reviews.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reviews',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './reviews.component.html',
  providers: [ReviewsService],
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  isLoading = false;
  errorMessage = '';

  private userId = '';

  constructor(
    private reviewsService: ReviewsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUser()?.userId!;

    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reviewsService.getUserReviews(this.userId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.errorMessage = 'Failed to load reviews. Please try again later.';
        this.isLoading = false;
      },
    });
  }

  // Helper method to get star rating display
  getStarRating(rating: string): number[] {
    const numericRating = parseFloat(rating);
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating - fullStars >= 0.5;

    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(1); // 1 represents a full star
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(0.5); // 0.5 represents a half star
    }

    // Add empty stars to make it 5 stars total
    while (stars.length < 5) {
      stars.push(0); // 0 represents an empty star
    }

    return stars;
  }
  // Add this method to reviews.component.ts
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src =
        'https://www.shutterstock.com/image-vector/car-logo-icon-emblem-design-600nw-473088025.jpg';
    }
  }
}
