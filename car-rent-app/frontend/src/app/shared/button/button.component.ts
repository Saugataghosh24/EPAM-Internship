import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() type: 'primary' | 'secondary' | 'underline' = 'primary';
  @Input() disabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();
  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
