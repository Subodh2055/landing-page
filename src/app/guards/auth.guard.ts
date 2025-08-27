import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private authStateService: AuthStateService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      console.log('User is authenticated, allowing access to:', state.url);
      return of(true);
    }

    // Check if there's a token that might need validation
    const token = this.authService.getToken();
    if (token) {
      console.log('Found token, validating...');
      return this.authService.validateToken(token).pipe(
        map(user => {
          console.log('Token validation successful, user:', user.username);
          return true;
        }),
        catchError(error => {
          console.log('Token validation failed:', error);
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return of(false);
        })
      );
    }

    // No authentication, redirect to login
    console.log('No authentication found, redirecting to login');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return of(false);
  }
}
