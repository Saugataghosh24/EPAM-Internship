// change-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { UserService, User, PasswordChangeResponse } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationComponent } from "../../../shared/notification/notification.component";

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NotificationComponent],
  templateUrl: './change-password.component.html',
  providers: [UserService]
})
export class ChangePasswordComponent implements OnInit {
  showCurrentPassword = false;
  showNewPassword = false;
  passwordError = false;
  showSuccessMessage = false;
  isLoading = false;
  
backendError = false;
  backendErrorMessage = '';
  

  currentPassword = '';
  newPassword = '';

  // Current password validation
  currentPasswordError = false;
  currentPasswordRequired = false;
  
// New password validation
  newPasswordError = false;
  newPasswordRequired = false;
  newPasswordTooShort = false;
  newPasswordWeak = false;
    // Confirm password validation
  confirmPasswordError = false;
  confirmPasswordRequired = false;
  confirmPasswordMismatch = false;
  
  alert='';
  message='';
  status=true;

  // User ID - in a real app, you might get this from an auth service
  private userId = ''; // Example ID
  
  constructor(private userService: UserService,
    private authService:AuthService
  ) {}
  
  ngOnInit(): void {
        this.userId=this.authService.getUser()?.userId!

    // We don't need to load user data for password change
  }
  
  validateCurrentPassword(): void {
    // Reset current password error flags
    this.currentPasswordRequired = false;
    this.currentPasswordError = false;
    this.passwordError = false;
    
    // Check if current password is empty
    if (!this.currentPassword) {
      this.currentPasswordRequired = true;
      this.currentPasswordError = true;
    }
  }
  
  validatePassword(): void {
    // Reset all error flags
    this.newPasswordRequired = false;
    this.newPasswordTooShort = false;
    this.newPasswordWeak = false;
    this.newPasswordError = false;
    
    // Check if password is empty
    if (!this.newPassword) {
      this.newPasswordRequired = true;
      this.newPasswordError = true;
      return;
    }
    
    // Check if password is too short
    if (this.newPassword.length < 8) {
      this.newPasswordTooShort = true;
      this.newPasswordError = true;
      return;
    }
    
    // Check if password contains at least one capital letter and one digit
    const hasCapital = /[A-Z]/.test(this.newPassword);
    const hasDigit = /[0-9]/.test(this.newPassword);
    
    if (!hasCapital || !hasDigit) {
      this.newPasswordWeak = true;
      this.newPasswordError = true;
      return;
    }
    
   
  }
   
  
  
  changePassword(): void {
    // Clear any previous backend errors
    this.backendError = false;
    this.backendErrorMessage = '';
   
    // Validate both passwords first
    this.validateCurrentPassword();
    this.validatePassword();
    
    // If there are any errors, don't proceed
    if (this.newPasswordError || this.confirmPasswordError || !this.currentPassword) {
      return;
    }
    

        
    
    this.isLoading = true;
    this.passwordError = false;
    
    this.userService.changePassword(this.userId, this.currentPassword, this.newPassword)
      .subscribe({
        next: (response) => {
          // Password changed successfully
          this.showSuccessMessage = true;
          this.currentPassword = '';
          this.newPassword = '';
          this.message='Password Changed Succesfully';
          this.alert='Congratulations!'
          this.status=true;
          // Update the token in localStorage if needed
          if (response.idToken) {
            localStorage.setItem('token', response.idToken);
          }
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
          
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error changing password:', error.message);
           this.backendError = true;

          this.alert='Error'
          this.message=error.message;
          this.status=false
          this.isLoading = false;
        
          
        }
      });
  }
}