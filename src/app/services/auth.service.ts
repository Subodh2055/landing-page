import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { AuthStateService } from './auth-state.service';
import { LocalStorageUtil } from '../utils/local-storage.util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api'; // Spring Boot Backend URL
  private currentUser: any = null;
  private useLocalStorage = true;
  
  // Session Configuration
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  constructor(
    private http: HttpClient,
    private authStateService: AuthStateService,
    private localStorageUtil: LocalStorageUtil
  ) {
    // Initialize data and restore session after a short delay to avoid initialization issues
    setTimeout(() => {
      this.initializeData();
      this.restoreSession();
    }, 100);
  }

  private initializeData(): void {
    try {
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
            createdAt: '2024-01-01T00:00:00.000Z',
            lastLogin: null,
            isActive: true
          },
          {
            id: 2,
            username: 'user',
            email: 'user@example.com',
            mobileNumber: '+9876543210',
            role: 'user',
            password: 'user123',
            createdAt: '2024-01-02T00:00:00.000Z',
            lastLogin: null,
            isActive: true
          }
        ];
        this.saveUsersToLocalStorage(defaultUsers);
        console.log('Default users initialized in localStorage');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      this.clearAllData();
    }
  }

  private restoreSession(): void {
    try {
      // Check for existing session data
      const token = this.getStoredToken();
      const storedUser = this.getStoredUser();
      const sessionExpiry = this.getStoredSessionExpiry();
      const lastActivity = this.getStoredLastActivity();
      
      if (token && storedUser && sessionExpiry && lastActivity) {
        // Check if session is still valid
        const now = Date.now();
        const isSessionExpired = now > sessionExpiry;
        const isInactive = (now - lastActivity) > this.INACTIVITY_TIMEOUT;
        
        if (isSessionExpired) {
          console.log('Session expired, clearing data');
          this.clearSession();
          return;
        }
        
        if (isInactive) {
          console.log('Session inactive for too long, clearing data');
          this.clearSession();
          return;
        }
        
        // Validate token and restore session
        this.validateToken(token).subscribe({
          next: (user) => {
            this.currentUser = user;
            this.authStateService.setCurrentUser(user);
            this.updateLastActivity();
            console.log('Session restored successfully for user:', user.username);
          },
          error: (error) => {
            console.log('Token validation failed, clearing session:', error);
            this.clearSession();
          }
        });
      } else {
        console.log('No valid session data found');
        this.clearSession();
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.currentUser = null;
    this.removeStoredToken();
    this.removeStoredUser();
    this.removeStoredSessionExpiry();
    this.removeStoredLastActivity();
    this.authStateService.clearCurrentUser();
  }

  private clearAllData(): void {
    try {
      this.localStorageUtil.clearAll();
      console.log('All localStorage data cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Enhanced localStorage methods using LocalStorageUtil
  private loadUsersFromLocalStorage(): any[] {
    try {
      const users = this.localStorageUtil.getItem<any[]>('users_data');
      if (!users || !Array.isArray(users)) {
        console.warn('Invalid users data format, resetting');
        return [];
      }
      return users;
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
      return [];
    }
  }

  private saveUsersToLocalStorage(users: any[]): void {
    try {
      if (!Array.isArray(users)) {
        throw new Error('Users data must be an array');
      }
      const success = this.localStorageUtil.setItem('users_data', users);
      if (!success) {
        throw new Error('Failed to save users to localStorage');
      }
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
      throw error;
    }
  }

  // Token management methods
  private getStoredToken(): string | null {
    try {
      return this.localStorageUtil.getItem<string>('auth_token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  private setStoredToken(token: string): void {
    try {
      const success = this.localStorageUtil.setItem('auth_token', token);
      if (!success) {
        throw new Error('Failed to store token');
      }
    } catch (error) {
      console.error('Error setting stored token:', error);
      throw error;
    }
  }

  private removeStoredToken(): void {
    try {
      this.localStorageUtil.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing stored token:', error);
    }
  }

  // User data management methods
  private getStoredUser(): any | null {
    try {
      return this.localStorageUtil.getItem<any>('current_user');
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  private setStoredUser(user: any): void {
    try {
      const success = this.localStorageUtil.setItem('current_user', user);
      if (!success) {
        throw new Error('Failed to store user data');
      }
    } catch (error) {
      console.error('Error setting stored user:', error);
      throw error;
    }
  }

  private removeStoredUser(): void {
    try {
      this.localStorageUtil.removeItem('current_user');
    } catch (error) {
      console.error('Error removing stored user:', error);
    }
  }

  // Session expiry management
  private getStoredSessionExpiry(): number | null {
    try {
      return this.localStorageUtil.getItem<number>('session_expiry');
    } catch (error) {
      console.error('Error getting session expiry:', error);
      return null;
    }
  }

  private setStoredSessionExpiry(): void {
    try {
      const expiry = Date.now() + this.SESSION_TIMEOUT;
      const success = this.localStorageUtil.setItem('session_expiry', expiry);
      if (!success) {
        throw new Error('Failed to store session expiry');
      }
    } catch (error) {
      console.error('Error setting session expiry:', error);
      throw error;
    }
  }

  private removeStoredSessionExpiry(): void {
    try {
      this.localStorageUtil.removeItem('session_expiry');
    } catch (error) {
      console.error('Error removing session expiry:', error);
    }
  }

  // Last activity management
  private getStoredLastActivity(): number | null {
    try {
      return this.localStorageUtil.getItem<number>('last_activity');
    } catch (error) {
      console.error('Error getting last activity:', error);
      return null;
    }
  }

  private setStoredLastActivity(): void {
    try {
      const success = this.localStorageUtil.setItem('last_activity', Date.now());
      if (!success) {
        throw new Error('Failed to store last activity');
      }
    } catch (error) {
      console.error('Error setting last activity:', error);
      throw error;
    }
  }

  private removeStoredLastActivity(): void {
    try {
      this.localStorageUtil.removeItem('last_activity');
    } catch (error) {
      console.error('Error removing last activity:', error);
    }
  }

  private updateLastActivity(): void {
    this.setStoredLastActivity();
  }

  private handleApiError(error: any, fallbackData?: any): Observable<any> {
    console.warn('API Error, falling back to localStorage:', error);
    this.useLocalStorage = true;
    
    if (fallbackData) {
      return of(fallbackData);
    }
    
    return throwError(() => new Error('Service unavailable, using local storage'));
  }

  login(identifier: string, password: string): Observable<any> {
    // identifier can be either username or email
    if (this.useLocalStorage) {
      const users = this.loadUsersFromLocalStorage();
      const user = users.find(u => 
        (u.username === identifier || u.email === identifier) && 
        u.password === password &&
        u.isActive === true
      );

      if (user) {
        const { password, ...userWithoutPassword } = user;
        const token = this.generateToken(user);
        const response = {
          ...userWithoutPassword,
          token
        };
        
        this.currentUser = response;
        this.saveSession(response, token);
        this.updateUserLastLogin(user.id);
        this.authStateService.setCurrentUser(response);
        return of(response);
      } else {
        // Check if user exists but password is wrong
        const userExists = users.find(u => 
          (u.username === identifier || u.email === identifier) &&
          u.isActive === true
        );
        
        if (userExists) {
          return throwError(() => new Error('Invalid password. Please check your password and try again.'));
        } else {
          return throwError(() => new Error('User not found or account is inactive. Please check your username/email and try again.'));
        }
      }
    }

    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      timeout(5000),
      map(users => {
        const user = users.find(u => 
          (u.username === identifier || u.email === identifier) && 
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
          this.saveSession(response, token);
          this.authStateService.setCurrentUser(response);
          return response;
        } else {
          // Check if user exists but password is wrong
          const userExists = users.find(u => 
            u.username === identifier || u.email === identifier
          );
          
          if (userExists) {
            throw new Error('Invalid password. Please check your password and try again.');
          } else {
            throw new Error('User not found. Please check your username/email and try again.');
          }
        }
      }),
      catchError(error => this.handleApiError(error))
    );
  }

  private saveSession(user: any, token: string): void {
    try {
      this.setStoredToken(token);
      this.setStoredUser(user);
      this.setStoredSessionExpiry();
      this.setStoredLastActivity();
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  private updateUserLastLogin(userId: number): void {
    try {
      const users = this.loadUsersFromLocalStorage();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].lastLogin = new Date().toISOString();
        this.saveUsersToLocalStorage(users);
      }
    } catch (error) {
      console.error('Error updating user last login:', error);
    }
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
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
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
    console.log('Logging out user:', this.currentUser?.username);
    this.clearSession();
  }

  // OAuth2 Methods
  getOAuth2Providers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/oauth2/providers`);
  }

  initiateOAuth2Login(provider: string): void {
    // Redirect to OAuth2 authorization URL
    const authUrl = `${this.apiUrl}/auth/oauth2/authorization/${provider}`;
    window.location.href = authUrl;
  }

  handleOAuth2Callback(): Observable<any> {
    // This method will be called after OAuth2 callback
    // The backend will handle the OAuth2 flow and return a JWT token
    return this.http.get(`${this.apiUrl}/auth/oauth2/callback`);
  }

  // Google OAuth2
  loginWithGoogle(): void {
    this.initiateOAuth2Login('google');
  }

  // GitHub OAuth2
  loginWithGitHub(): void {
    this.initiateOAuth2Login('github');
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
    return this.currentUser?.token || this.getStoredToken();
  }

  validateToken(token: string): Observable<any> {
    try {
      const payload = JSON.parse(atob(token));
      const userId = payload.id;
      
      // Check if token is expired
      if (payload.exp <= Date.now()) {
        return throwError(() => new Error('Token expired'));
      }
      
      if (this.useLocalStorage) {
        const users = this.loadUsersFromLocalStorage();
        const user = users.find(u => u.id === userId && u.isActive === true);
        
        if (user) {
          const { password, ...userWithoutPassword } = user;
          return of(userWithoutPassword);
        } else {
          return throwError(() => new Error('User not found or inactive'));
        }
      }

      return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
        timeout(5000),
        map(user => {
          if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          } else {
            throw new Error('User not found');
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
      exp: Date.now() + this.SESSION_TIMEOUT
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
          this.saveSession(userWithoutPassword, this.getToken() || '');
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
          this.saveSession(userWithoutPassword, this.getToken() || '');
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

  // Get session info for debugging
  getSessionInfo(): any {
    return {
      isAuthenticated: this.isAuthenticated(),
      currentUser: this.currentUser ? this.currentUser.username : null,
      hasToken: !!this.getToken(),
      sessionExpiry: this.getStoredSessionExpiry(),
      lastActivity: this.getStoredLastActivity(),
      usingLocalStorage: this.useLocalStorage,
      storageStats: this.localStorageUtil.getStorageStats()
    };
  }

  // Clear all data (for testing/debugging)
  clearAllDataForTesting(): void {
    this.clearAllData();
    this.currentUser = null;
    this.authStateService.clearCurrentUser();
    console.log('All data cleared for testing');
  }
}
