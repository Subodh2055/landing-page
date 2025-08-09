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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      
      // Show loading toast
      this.toastr.info('Authenticating your credentials...', 'Please Wait', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: false,
        progressBar: true
      });
      
      // Validate credentials using controller
      const validation = this.authController.validateCredentials(email, password);
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
      
      this.authController.login(email, password).subscribe({
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
            this.router.navigate(['/products']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.clear();
          
          // Provide specific error messages based on the error
          let errorMessage = 'Login failed. Please try again.';
          let errorTitle = 'Login Error';
          
          if (error.message) {
            if (error.message.includes('Invalid credentials')) {
              errorMessage = 'The email or password you entered is incorrect. Please check your credentials and try again.';
              errorTitle = 'Invalid Credentials';
            } else if (error.message.includes('User not found')) {
              errorMessage = 'No account found with this email address. Please register or check your email.';
              errorTitle = 'Account Not Found';
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
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');

    if (emailControl?.errors) {
      if (emailControl.errors['required']) {
        errors.push('Email is required');
      } else if (emailControl.errors['email']) {
        errors.push('Please enter a valid email address');
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
}
