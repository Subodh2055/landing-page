import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
  private users: any[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      password: 'admin123'
    },
    {
      id: 2,
      username: 'user',
      email: 'user@example.com',
      role: 'user',
      password: 'user123'
    }
  ];

  login(credentials: { username: string; password: string }): Observable<any> {
    const user = this.users.find(u => 
      (u.username === credentials.username || u.email === credentials.username) && 
      u.password === credentials.password
    );

    if (user) {
      const { password, ...userWithoutPassword } = user;
      return of({
        ...userWithoutPassword,
        token: this.generateToken(user)
      }).pipe(delay(1000)); // Simulate network delay
    }

    return throwError(() => new Error('Invalid credentials'));
  }

  register(userData: { username: string; email: string; password: string }): Observable<any> {
    // Check if username already exists
    const existingUser = this.users.find(u => u.username === userData.username);
    if (existingUser) {
      return throwError(() => new Error('Username already exists'));
    }

    const newUser = {
      id: this.users.length + 1,
      username: userData.username,
      email: userData.email,
      role: 'user', // Default role for new registrations
      password: userData.password
    };

    this.users.push(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return of({
      ...userWithoutPassword,
      token: this.generateToken(newUser)
    }).pipe(delay(1000));
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

  validateToken(token: string): Observable<any> {
    try {
      const payload = JSON.parse(atob(token));
      const user = this.users.find(u => u.id === payload.id);
      
      if (user && payload.exp > Date.now()) {
        const { password, ...userWithoutPassword } = user;
        return of(userWithoutPassword);
      }
      
      return throwError(() => new Error('Invalid token'));
    } catch (error) {
      return throwError(() => new Error('Invalid token'));
    }
  }
}
