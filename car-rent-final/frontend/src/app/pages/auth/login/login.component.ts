import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/button/button.component';
import { AuthService } from '../../../services/auth.service';
import { NotificationComponent } from '../../../shared/notification/notification.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent,NotificationComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  successMessage: string = '';
  showPassword: boolean = false;
  passwordIncorrect: boolean = false; 
  errorMsg="";
  alert="";
  message="";
  status=true;
  showalert=false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService:AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator]],
      password: ['', [Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]]
    });

    // Check if redirected from registration with success message
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['successMessage']) {
      this.successMessage = navigation.extras.state['successMessage'];
      const message = "Congratulations! You have successfully created your account!";
      const [title, body] = message.split('! ', 2); 
      this.alert=title;
      this.message=body;
      this.showalert=true;
      setTimeout(() => {
        this.showalert=false;
      }, 10000);
    }
  }

  onSubmit(): void {
    this.loading = true;

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const payload= {
        email: email.toLowerCase(),
        password: password
      };

      this.authService.login(payload).subscribe({
        next: (user) => {
          if(user.role === 'Admin') {
            this.router.navigate(['/dashboard']);
          } else if(user.role === 'Support') {
            this.router.navigate(['/bookings']);
          }
          else if(user.role === 'Client') {
            this.router.navigate(['/']);
          }else {
            this.router.navigate(['/']);
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.errorMsg = error;
          this.passwordIncorrect= true;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  emailValidator(control: AbstractControl): ValidationErrors | null {
    // This regex pattern validates common email format
    
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]*(\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/;
    const valid = emailRegex.test(control.value);
    
    return valid ? null : { invalidEmail: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  closeAlert(): void {
    this.errorMsg = '';
    this.successMessage = '';
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
}