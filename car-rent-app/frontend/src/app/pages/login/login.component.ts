import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/button/button.component';
import { AuthService } from '../../services/auth.service';
import { NotificationComponent } from '../../shared/notification/notification.component';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService:AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator]],
      password: ['', [Validators.required]]
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
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (user) => {
          setTimeout(() => this.router.navigate(['/']), 200);
        },
        error: () => {
          this.errorMsg = 'Invalid credentials';
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
}