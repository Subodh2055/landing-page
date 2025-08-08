import { Component, HostListener } from '@angular/core';
import { AuthController } from '../../controllers/auth.controller';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isScrolled = false;
  currentUser: User | null = null;

  constructor(private authController: AuthController) {
    this.currentUser = this.authController.getCurrentUser();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  isAuthenticated(): boolean {
    return this.authController.isAuthenticated();
  }

  hasRole(role: string): boolean {
    return this.authController.hasRole(role);
  }

  logout(): void {
    this.authController.logout();
    this.currentUser = null;
  }

  getUserInitials(): string {
    if (this.currentUser) {
      return this.currentUser.username.substring(0, 2).toUpperCase();
    }
    return '';
  }
}
