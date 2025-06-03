import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  imports: [CommonModule,ButtonComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {
  constructor(private router:Router){}
  @Input() alert:string='';
  @Input() message:string='';
  @Input() success:boolean=false;

  visible=true;
  
  login(){
    this.visible=false;
    this.router.navigate(['/auth','sign-in'])
  }

  closeNotification(){
    this.visible=false;
  }
}
