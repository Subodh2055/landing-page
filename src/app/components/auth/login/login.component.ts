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
      
      // Validate credentials using controller
      const validation = this.authController.validateCredentials(email, password);
      if (!validation.isValid) {
        this.toastr.error(validation.errors.join(', '), 'Validation Error');
        this.loading = false;
        return;
      }
      
      this.authController.login(email, password).subscribe({
        next: (user: User) => {
          this.loading = false;
          this.showSuccess = true;
          
          // Hide success animation after 2 seconds
          setTimeout(() => {
            this.showSuccess = false;
            this.toastr.success(`Welcome back, ${user.username}!`, 'Login Successful');
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.message || 'Login failed. Please try again.', 'Login Error');
        }
      });
    } else {
      this.toastr.warning('Please fill in all required fields correctly.', 'Validation Error');
    }
  }
}
