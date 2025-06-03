// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = {
    email: '',
    password: ''
  };
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    console.log('Login form submitted', this.loginForm); // Add this for debugging
    this.errorMessage = '';
    
    try {
      const success = this.authService.login(this.loginForm.email, this.loginForm.password);
      console.log('Login success:', success); // Add this for debugging
      
      if (success) {
        this.router.navigate(['/recipes']);
      } else {
        this.errorMessage = 'Invalid email or password';
      }
    } catch (error) {
      console.error('Login error:', error); // Add this for debugging
      this.errorMessage = 'An error occurred during login';
    }
  }
}