import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ButtonComponent } from '../../../shared/button/button.component';
import { UserService, User } from '../../../services/user.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, HttpClientModule],
  templateUrl: './change-password.component.html',
  providers: [UserService]
})
export class ChangePasswordComponent implements OnInit {
  showCurrentPassword = false;
  showNewPassword = false;
  passwordError = false;
  showSuccessMessage = false;
  isLoading = false;
  
  currentPassword = '';
  newPassword = '';
  
  currentUser: User | null = null;
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUserData();
  }
  
  loadUserData(): void {
    // In a real app, you would get the user ID from an auth service
    // For now, we'll use a hardcoded ID
    const userId = '01ae';
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      }
    });
  }
  
  async changePassword() {
    if (!this.currentUser || !this.currentPassword || !this.newPassword) {
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Hash the current password for comparison
      const hashedCurrentPassword = await this.userService.hashPassword(this.currentPassword);
      
      // Check if current password matches
      if (hashedCurrentPassword !== this.currentUser.password) {
        this.passwordError = true;
        this.isLoading = false;
        return;
      }
      
      // Hash the new password
      const hashedNewPassword = await this.userService.hashPassword(this.newPassword);
      
      // Update user with new password
      const updatedUser = {
        ...this.currentUser,
        password: hashedNewPassword
      };
      
      this.userService.updateUser(updatedUser).subscribe({
        next: (response) => {
          this.currentUser = response;
          this.showSuccessMessage = true;
          this.passwordError = false;
          this.currentPassword = '';
          this.newPassword = '';
          this.isLoading = false;
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
        },
        error: (error) => {
          console.error('Error updating password:', error);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error during password change:', error);
      this.isLoading = false;
    }
  }
}