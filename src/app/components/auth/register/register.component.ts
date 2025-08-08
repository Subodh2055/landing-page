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
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
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

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const { username, email, password, role } = this.registerForm.value;
      
      // Validate registration using controller
      const validation = this.authController.validateRegistration(username, email, password, this.registerForm.get('confirmPassword')?.value);
      if (!validation.isValid) {
        this.toastr.error(validation.errors.join(', '), 'Validation Error');
        this.loading = false;
        return;
      }
      
      this.authController.register(username, email, password, role).subscribe({
        next: (user: User) => {
          this.loading = false;
          this.showSuccess = true;
          
          // Hide success animation after 2 seconds
          setTimeout(() => {
            this.showSuccess = false;
            this.toastr.success(`Welcome, ${user.username}! Please login to continue.`, 'Registration Successful');
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.message || 'Registration failed. Please try again.', 'Registration Error');
        }
      });
    } else {
      this.toastr.warning('Please fill in all required fields correctly.', 'Validation Error');
    }
  }
}
