import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // JSON Server URL
  private currentUser: any = null;

  constructor(private http: HttpClient) {
    // Check for existing token on service initialization
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.validateToken(token).subscribe({
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
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        const user = users.find(u => 
          (u.username === email || u.email === email) && 
          u.password === password
        );

        if (user) {
          const { password, ...userWithoutPassword } = user;
          const token = this.generateToken(user);
          const response = {
            ...userWithoutPassword,
            token
          };
          
          this.currentUser = response;
          localStorage.setItem('auth_token', token);
          return response;
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.message || 'Login failed'));
      })
    );
  }

  register(username: string, email: string, password: string, role: string, mobileNumber: string): Observable<any> {
    // First check if user already exists
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => {
        // Check if username already exists
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
          throw new Error('Username already exists');
        }

        // Check if email already exists
        const existingEmail = users.find(u => u.email === email);
        if (existingEmail) {
          throw new Error('Email already exists');
        }

        // Check if mobile number already exists
        const existingMobile = users.find(u => u.mobileNumber === mobileNumber);
        if (existingMobile) {
          throw new Error('Mobile number already exists');
        }

        // Create new user
        const newUser = {
          id: this.getNextUserId(users),
          username,
          email,
          mobileNumber,
          role: role || 'user',
          password,
          createdAt: new Date().toISOString()
        };

        return this.http.post<any>(`${this.apiUrl}/users`, newUser).pipe(
          map(createdUser => {
            const { password, ...userWithoutPassword } = createdUser;
            return userWithoutPassword;
          })
        );
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(error.message || 'Registration failed'));
      })
    );
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

  validateToken(token: string): Observable<any> {
    try {
      const payload = JSON.parse(atob(token));
      const userId = payload.id;
      
      return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
        map(user => {
          if (user && payload.exp > Date.now()) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          } else {
            throw new Error('Invalid token');
          }
        }),
        catchError(error => {
          console.error('Token validation error:', error);
          return throwError(() => new Error('Invalid token'));
        })
      );
    } catch (error) {
      return throwError(() => new Error('Invalid token'));
    }
  }

  private generateToken(user: any): string {
    // Simple token generation (in real app, this would be a proper JWT)
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    return btoa(JSON.stringify(payload));
  }

  private getNextUserId(users: any[]): number {
    const maxId = Math.max(...users.map(u => u.id), 0);
    return maxId + 1;
  }

  // Get all users (admin only)
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      })),
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to fetch users'));
      })
    );
  }

  // Update user profile
  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      map(updatedUser => {
        const { password, ...userWithoutPassword } = updatedUser;
        
        // Update current user if it's the same user
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser = userWithoutPassword;
        }
        
        return userWithoutPassword;
      }),
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => new Error('Failed to update user'));
      })
    );
  }

  // Delete user (admin only)
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(error => {
        console.error('Error deleting user:', error);
        return throwError(() => new Error('Failed to delete user'));
      })
    );
  }
}
