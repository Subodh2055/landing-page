import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthController {
  constructor(private authService: AuthService) {}

  login(identifier: string, password: string): Observable<User> {
    return new Observable(observer => {
      this.authService.login(identifier, password).subscribe({
        next: (response: any) => {
          const user = User.fromJson(response);
          observer.next(user);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  register(username: string, email: string, password: string, role: string, mobileNumber: string): Observable<User> {
    return new Observable(observer => {
      this.authService.register(username, email, password, role, mobileNumber).subscribe({
        next: (response: any) => {
          const user = User.fromJson(response);
          observer.next(user);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    this.authService.logout();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUser(): User | null {
    const userData = this.authService.getCurrentUser();
    return userData ? User.fromJson(userData) : null;
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  getToken(): string | null {
    return this.authService.getToken();
  }

  validateCredentials(identifier: string, password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!identifier || identifier.trim() === '') {
      errors.push('Username or Email is required');
    }

    if (!password || password.trim() === '') {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateRegistration(username: string, email: string, password: string, confirmPassword: string, mobileNumber?: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!username || username.trim() === '') {
      errors.push('Username is required');
    } else if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!email || email.trim() === '') {
      errors.push('Email is required');
    } else if (!this.isValidEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    if (!mobileNumber || mobileNumber.trim() === '') {
      errors.push('Mobile number is required');
    } else if (!this.isValidMobileNumber(mobileNumber)) {
      errors.push('Please enter a valid mobile number');
    }

    if (!password || password.trim() === '') {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!confirmPassword || confirmPassword.trim() === '') {
      errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidMobileNumber(mobileNumber: string): boolean {
    const mobileRegex = /^[+]?[1-9]\d{1,14}$/;
    return mobileRegex.test(mobileNumber);
  }
}
