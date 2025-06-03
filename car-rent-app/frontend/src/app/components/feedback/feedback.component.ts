import { CommonModule } from '@angular/common';

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { StarRatingComponent } from "../../shared/star-rating/star-rating.component";
import { FeedbackInfo } from '../../models/FeedbackInfo.model';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback',
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit,AfterViewInit {
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  feedbacks:FeedbackInfo[]=[];
  isScrollLeftDisabled = true;
  isScrollRightDisabled = false;
  isLoading = true;
  error:string|null = null;

  constructor(private feedbackService: FeedbackService) { }
  ngOnInit(): void {
    this.loadFeedbacks();
  }
  loadFeedbacks(): void {
    this.isLoading = true;
    this.error = null;
    
    this.feedbackService.getFeedbackInfo().subscribe({
      next: (data) => {
        this.feedbacks = data;
        this.isLoading = false;
        
        // Check scroll buttons after data is loaded
        setTimeout(() => {
          this.checkScrollButtons();
        }, 100);
      },
      error: (err) => {
        console.error('Error fetching feedback data:', err);
        this.error = 'Failed to load feedback data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.carouselContainer?.nativeElement) {
      return;
    }
    // Check initial scroll state after a short delay to ensure DOM is fully rendered
    setTimeout(() => {
      this.checkScrollButtons();
      
      // Add scroll event listener to update button states
      this.carouselContainer.nativeElement.addEventListener('scroll', () => {
        this.checkScrollButtons();
      });
    }, 100);
  }
  
  scrollLeft(): void {
    const container = this.carouselContainer.nativeElement;
    // Scroll by the width of one card plus gap
    const scrollAmount = 400; // Approximate width of card + gap
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    
    // Update button states after scrolling
    setTimeout(() => {
      this.checkScrollButtons();
    }, 350); // Wait for scroll animation to complete
  }
  
  scrollRight(): void {
    const container = this.carouselContainer.nativeElement;
    // Scroll by the width of one card plus gap
    const scrollAmount = 400; // Approximate width of card + gap
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    
    // Update button states after scrolling
    setTimeout(() => {
      this.checkScrollButtons();
    }, 350); // Wait for scroll animation to complete
  }
  
  checkScrollButtons(): void {
    const container = this.carouselContainer?.nativeElement;
    if (!container) {
      return; // Return early if container is undefined
    }
  
    
    // Check if scrolled to the left edge (with a small threshold)
    this.isScrollLeftDisabled = container.scrollLeft <=0;
    
    // Check if scrolled to the right edge (with a small threshold)
    this.isScrollRightDisabled = 
      Math.abs(container.scrollLeft + container.clientWidth - container.scrollWidth) < 10;
  }}