import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.authService.getCurrentUser();
    const requiredRoles = route.data['roles'] as Array<string>;

    if (user && requiredRoles.includes(user.role)) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
