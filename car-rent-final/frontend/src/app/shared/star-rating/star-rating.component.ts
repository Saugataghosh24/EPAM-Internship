import { Component, Input } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() size: string = 'h-4 w-4 ';

  stars = [1, 2, 3, 4, 5];
}


