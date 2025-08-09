import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // JSON Server URL
  private currentUser: any = null;
  private useLocalStorage = false;
  private readonly USERS_STORAGE_KEY = 'users_data';

  constructor(private http: HttpClient) {
    this.initializeData();
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

  private initializeData(): void {
    // Try to load from localStorage first
    const storedUsers = this.loadUsersFromLocalStorage();
    if (storedUsers.length === 0) {
      // Initialize with default users if no data exists
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          mobileNumber: '+1234567890',
          role: 'admin',
          password: 'admin123',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          username: 'user',
          email: 'user@example.com',
          mobileNumber: '+9876543210',
          role: 'user',
          password: 'user123',
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ];
      this.saveUsersToLocalStorage(defaultUsers);
    }
  }

  private loadUsersFromLocalStorage(): any[] {
    try {
      const stored = localStorage.getItem(this.USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
      return [];
    }
  }

  private saveUsersToLocalStorage(users: any[]): void {
    try {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }

  private handleApiError(error: any, fallbackData?: any): Observable<any> {
    console.warn('API Error, falling back to localStorage:', error);
    this.useLocalStorage = true;
    
    if (fallbackData) {
      return of(fallbackData);
    }
    
    return throwError(() => new Error('Service unavailable, using local storage'));
  }

  login(email: string, password: string): Observable<any> {
    if (this.useLocalStorage) {
      const users = this.loadUsersFromLocalStorage();
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
        return of(response);
      } else {
        return throwError(() => new Error('Invalid credentials'));
      }
    }

    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      timeout(5000),
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
      catchError(error => this.handleApiError(error))
    );
  }

  register(username: string, email: string, password: string, role: string, mobileNumber: string): Observable<any> {
    if (this.useLocalStorage) {
      const users = this.loadUsersFromLocalStorage();
      
      // Check if username already exists
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        return throwError(() => new Error('Username already exists'));
      }

      // Check if email already exists
      const existingEmail = users.find(u => u.email === email);
      if (existingEmail) {
        return throwError(() => new Error('Email already exists'));
      }

      // Check if mobile number already exists
      const existingMobile = users.find(u => u.mobileNumber === mobileNumber);
      if (existingMobile) {
        return throwError(() => new Error('Mobile number already exists'));
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

      users.push(newUser);
      this.saveUsersToLocalStorage(users);

      const { password: _, ...userWithoutPassword } = newUser;
      return of(userWithoutPassword);
    }

    // First check if user already exists
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      timeout(5000),
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
      catchError(error => this.handleApiError(error))
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
      
      if (this.useLocalStorage) {
        const users = this.loadUsersFromLocalStorage();
        const user = users.find(u => u.id === userId);
        
        if (user && payload.exp > Date.now()) {
          const { password, ...userWithoutPassword } = user;
          return of(userWithoutPassword);
        } else {
          return throwError(() => new Error('Invalid token'));
        }
      }

      return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
        timeout(5000),
        map(user => {
          if (user && payload.exp > Date.now()) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          } else {
            throw new Error('Invalid token');
          }
        }),
        catchError(error => this.handleApiError(error))
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
    if (this.useLocalStorage) {
      const users = this.loadUsersFromLocalStorage();
      return of(users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }));
    }

    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      timeout(5000),
      map(users => users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      })),
      catchError(error => this.handleApiError(error))
    );
  }

  // Update user profile
  updateUser(userId: number, userData: any): Observable<any> {
    if (this.useLocalStorage) {
      const users = this.loadUsersFromLocalStorage();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        this.saveUsersToLocalStorage(users);
        
        const { password, ...userWithoutPassword } = users[userIndex];
        
        // Update current user if it's the same user
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser = userWithoutPassword;
        }
        
        return of(userWithoutPassword);
      }
      return throwError(() => new Error('User not found'));
    }

    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      timeout(5000),
      map(updatedUser => {
        const { password, ...userWithoutPassword } = updatedUser;
        
        // Update current user if it's the same user
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser = userWithoutPassword;
        }
        
        return userWithoutPassword;
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  // Delete user (admin only)
  deleteUser(userId: number): Observable<void> {
    if (this.useLocalStorage) {
      const users = this.loadUsersFromLocalStorage();
      const filteredUsers = users.filter(u => u.id !== userId);
      this.saveUsersToLocalStorage(filteredUsers);
      return of(void 0);
    }

    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`).pipe(
      timeout(5000),
      catchError(error => this.handleApiError(error))
    );
  }

  // Check if using localStorage
  isUsingLocalStorage(): boolean {
    return this.useLocalStorage;
  }

  // Force refresh from server
  refreshFromServer(): void {
    this.useLocalStorage = false;
  }
}
