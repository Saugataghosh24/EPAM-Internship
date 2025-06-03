// src/app/shared/models/client-review.model.ts
export interface ClientReview {
    author: string;             // Author name
    authorInitial?: string;     // First letter of author name (for fallback avatar)
    authorImageUrl?: string;    // Author image URL
    date: string;               // Date of review
    rentalExperience: string;   // Rating score (e.g., "4.5")
    text: string;               // Review text
  }
export interface ClientReviewResponse{
  content:ClientReview[],
  currentPage:number,
  totalElements:number,
  totalPages:number
}