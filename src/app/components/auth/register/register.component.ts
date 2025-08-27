import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthController } from '../../../controllers/auth.controller';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  showSuccess = false;
  showPassword = false;
  showConfirmPassword = false;

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
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[+]?[1-9]\d{1,14}$/)
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      role: ['user', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const { username, email, mobileNumber, password, role } = this.registerForm.value;
      
      // Show loading toast
      this.toastr.info('Creating your account...', 'Please Wait', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: false,
        progressBar: true
      });
      
      // Validate registration using controller
      const validation = this.authController.validateRegistration(username, email, password, this.registerForm.get('confirmPassword')?.value, mobileNumber);
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
      
      this.authController.register(username, email, password, role, mobileNumber).subscribe({
        next: (user: User) => {
          this.loading = false;
          this.showSuccess = true;
          
          // Clear loading toast
          this.toastr.clear();
          
          // Hide success animation after 2 seconds
          setTimeout(() => {
            this.showSuccess = false;
            this.toastr.success(
              `Welcome, ${user.username}! Your account has been created successfully. Please login to continue.`, 
              'Registration Successful', 
              {
                timeOut: 5000,
                progressBar: true,
                closeButton: true,
                enableHtml: true
              }
            );
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.clear();
          
          // Provide specific error messages based on the error
          let errorMessage = 'Registration failed. Please try again.';
          let errorTitle = 'Registration Error';
          
          if (error.message) {
            if (error.message.includes('Username already exists')) {
              errorMessage = 'This username is already taken. Please choose a different username.';
              errorTitle = 'Username Already Exists';
            } else if (error.message.includes('Email already exists')) {
              errorMessage = 'An account with this email already exists. Please login or use a different email.';
              errorTitle = 'Email Already Exists';
            } else if (error.message.includes('Mobile number already exists')) {
              errorMessage = 'An account with this mobile number already exists. Please use a different number.';
              errorTitle = 'Mobile Number Already Exists';
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

  registerWithGoogle(): void {
    this.toastr.info('Google registration feature coming soon!', 'Feature Preview', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }

  registerWithGitHub(): void {
    this.toastr.info('GitHub registration feature coming soon!', 'Feature Preview', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true
    });
  }

  private getFormErrors(): string[] {
    const errors: string[] = [];
    const controls = this.registerForm.controls;

    // Check username
    if (controls['username']?.errors) {
      if (controls['username'].errors['required']) {
        errors.push('Username is required');
      } else if (controls['username'].errors['minlength']) {
        errors.push('Username must be at least 3 characters long');
      }
    }

    // Check email
    if (controls['email']?.errors) {
      if (controls['email'].errors['required']) {
        errors.push('Email is required');
      } else if (controls['email'].errors['email']) {
        errors.push('Please enter a valid email address');
      }
    }

    // Check mobile number
    if (controls['mobileNumber']?.errors) {
      if (controls['mobileNumber'].errors['required']) {
        errors.push('Mobile number is required');
      } else if (controls['mobileNumber'].errors['pattern']) {
        errors.push('Please enter a valid mobile number');
      }
    }

    // Check password
    if (controls['password']?.errors) {
      if (controls['password'].errors['required']) {
        errors.push('Password is required');
      } else if (controls['password'].errors['minlength']) {
        errors.push('Password must be at least 6 characters long');
      }
    }

    // Check confirm password
    if (controls['confirmPassword']?.errors) {
      if (controls['confirmPassword'].errors['required']) {
        errors.push('Please confirm your password');
      }
    }

    // Check terms acceptance
    if (controls['acceptTerms']?.errors) {
      if (controls['acceptTerms'].errors['required']) {
        errors.push('Please accept the Terms & Conditions');
      }
    }

    // Check password match
    if (this.registerForm.errors?.['passwordMismatch']) {
      errors.push('Passwords do not match');
    }

    return errors;
  }
}
