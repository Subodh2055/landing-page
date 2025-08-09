import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { MockBackendService } from './mock-backend.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;

  constructor(private mockBackend: MockBackendService) {
    // Check for existing token on service initialization
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.mockBackend.validateToken(token).subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: () => {
          localStorage.removeItem('auth_token');
        }
      });
    }
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.mockBackend.login({ username: email, password }).subscribe({
        next: (response: any) => {
          this.currentUser = response;
          localStorage.setItem('auth_token', response.token);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(new Error(error.message || 'Login failed'));
        }
      });
    });
  }

  register(username: string, email: string, password: string, role: string, mobileNumber: string): Observable<any> {
    return new Observable(observer => {
      this.mockBackend.register({ username, email, password, mobileNumber }).subscribe({
        next: (response: any) => {
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(new Error(error.message || 'Registration failed'));
        }
      });
    });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  getToken(): string | null {
    return this.currentUser?.token || null;
  }
}
