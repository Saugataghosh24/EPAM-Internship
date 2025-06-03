// feedback-form.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.css'],
  imports:[CommonModule,FormsModule,ReactiveFormsModule,ButtonComponent],
  animations: [
    // You can reuse the same animations from the cancel confirmation component
  ]
})
export class FeedbackFormComponent {
  @Input() carModel: string = '';
  @Input() carYear: string = '';
  @Output() submit = new EventEmitter<{rating: number, comment: string}>();
  @Output() cancel = new EventEmitter<void>();

  feedbackForm: FormGroup;
  rating: number = 0;

  constructor(private fb: FormBuilder) {
    this.feedbackForm = this.fb.group({
      comment: ['', []]
    });
  }

  setRating(value: number): void {
    this.rating = value;
  }

  onSubmit(): void {
    if (this.rating > 0) {
      this.submit.emit({
        rating: this.rating,
        comment: this.feedbackForm.get('comment')?.value || ''
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}