import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthController } from '../../../controllers/auth.controller';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  showSuccess = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authController: AuthController,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]], // Can be username or email
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { identifier, password } = this.loginForm.value;

      // Show loading toast
      this.toastr.info('Authenticating your credentials...', 'Please Wait', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: false,
        progressBar: true
      });

      // Validate credentials using controller
      const validation = this.authController.validateCredentials(identifier, password);
      if (!validation.isValid) {
        this.toastr.clear();
        this.toastr.error(validation.errors.join(', '), 'Invalid Input', {
          timeOut: 5000,
          progressBar: true,
          closeButton: true
        });
        this.loading = false;
        return;
      }

      this.authController.login(identifier, password).subscribe({
        next: (user: User) => {
          this.loading = false;
          this.showSuccess = true;

          // Clear loading toast
          this.toastr.clear();

          // Hide success animation after 2 seconds
          setTimeout(() => {
            this.showSuccess = false;
            this.toastr.success(
              `Welcome back, ${user.username}! You have successfully logged in.`,
              'Login Successful',
              {
                timeOut: 4000,
                progressBar: true,
                closeButton: true,
                enableHtml: true
              }
            );
            
            // Navigate based on user role
            if (user.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/products']);
            }
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.clear();

          // Provide specific error messages based on the error
          let errorMessage = 'Login failed. Please try again.';
          let errorTitle = 'Login Error';

          if (error.message) {
            if (error.message.includes('Invalid password')) {
              errorMessage = 'The password you entered is incorrect. Please check your password and try again.';
              errorTitle = 'Invalid Password';
            } else if (error.message.includes('User not found')) {
              errorMessage = 'No account found with this username/email. Please check your credentials or register a new account.';
              errorTitle = 'User Not Found';
            } else if (error.message.includes('Network')) {
              errorMessage = 'Network connection issue. Please check your internet connection and try again.';
              errorTitle = 'Connection Error';
            } else {
              errorMessage = error.message;
            }
          }

          this.toastr.error(errorMessage, errorTitle, {
            timeOut: 6000,
            progressBar: true,
            closeButton: true,
            enableHtml: true
          });
        }
      });
    } else {
      // Show form validation errors
      const errors = this.getFormErrors();
      this.toastr.warning(
        `Please fix the following issues: ${errors.join(', ')}`,
        'Form Validation Error',
        {
          timeOut: 5000,
          progressBar: true,
          closeButton: true
        }
      );
    }
  }

  private getFormErrors(): string[] {
    const errors: string[] = [];
    const identifierControl = this.loginForm.get('identifier');
    const passwordControl = this.loginForm.get('password');

    if (identifierControl?.errors) {
      if (identifierControl.errors['required']) {
        errors.push('Username or Email is required');
      }
    }

    if (passwordControl?.errors) {
      if (passwordControl.errors['required']) {
        errors.push('Password is required');
      } else if (passwordControl.errors['minlength']) {
        errors.push('Password must be at least 6 characters long');
      }
    }

    return errors;
  }

  // OAuth2 Methods
  loginWithGoogle(): void {
    this.authController.loginWithGoogle();
  }

  loginWithGitHub(): void {
    this.authController.loginWithGitHub();
  }
}
