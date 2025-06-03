import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  loggedIn=false;
  role?='Client';
  private authSubscription?: Subscription;
  constructor(private authService: AuthService){

  }
  
  ngOnInit(){
    this.updateAuthState();
    this.authSubscription = this.authService.currentUser$.subscribe((user: LoginResponse | null) => {
          this.loggedIn = !!user;
          if (user) {
      
            this.role = user.role;
          } else {
            this.role = undefined;
          }
          //this.setDefaultActive();
        });
  }

  updateAuthState() {
    this.loggedIn = this.authService.isLoggedIn();
    if (this.loggedIn) {
      const user = this.authService.getUser();
      if (user) {
        this.role = user.role;
      }
    }
  }  

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }  
}
