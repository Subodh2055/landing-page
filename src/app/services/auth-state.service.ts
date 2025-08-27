import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor() {}

  // Observable to subscribe to current user changes
  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  // Get current user value
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Update current user (called when user logs in)
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  // Clear current user (called when user logs out)
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }
}
