import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/button/button.component';
import { AuthService, RegisterPayload } from '../../../services/auth.service';
import { catchError, finalize, last, of, switchMap } from 'rxjs';
 
@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  emailExists: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';
  isLoading: boolean = false;
 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z']+$/)
      ]],
      lastName: ['', [
        Validators.pattern(/^[a-zA-Z']+$/)
      ]],
      email: ['', [Validators.required, this.emailValidator]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
 
  ngOnInit(): void {
    // Reset email exists error when email changes
    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      if (this.emailExists) {
        this.emailExists = false;
        this.errorMessage = '';
        this.errorMsg = '';
      }
    });
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    // This regex pattern validates common email format
    
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]*(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/;
    
    const valid = emailRegex.test(control.value);
    
    return valid ? null : { invalidEmail: true };
  }

 
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;
   
    const hasCapital = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
   
    if (!hasCapital || !hasDigit) {
      return { passwordStrength: true };
    }
   
    return null;
  }
 
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
   
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
   
    return null;
  }
 
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.errorMsg = '';
      this.successMsg = '';
      this.emailExists = false;
     
      const payload: RegisterPayload = {
        firstName: this.registerForm.get('firstName')?.value,
        lastName: this.registerForm.get('lastName')?.value,
        email: this.registerForm.get('email')?.value?.toLowerCase(),
        password: this.registerForm.get('password')?.value
      };
      
      this.authService.register(payload).pipe(
        catchError(error => {
          const backendError = error?.error?.error || '';
      
          if (error.status === 409 || backendError === 'User already exists') {
            this.emailExists = true;
            this.errorMessage = 'This email is already registered. Please use a different email or login.';
            this.errorMsg = 'This email is already registered.';
          } else if (error.status === 400) {
            this.errorMessage = backendError || 'Validation error. Please check your input.';
            this.errorMsg = this.errorMessage;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
            this.errorMsg = 'Registration failed. Try again.';
          }
      
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe(result => {
        if (result) {
          this.successMsg = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/auth/sign-in'], {
              state: { successMessage: 'Congratulations! You have successfully created your account!' }
            });
          }, 1000);
        }
      });
      
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
 
  onCancel(): void {
    this.router.navigate(['/']);
  }
 
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
 
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
 
  closeAlert(): void {
    this.errorMessage = '';
    this.errorMsg = '';
  }
}
 