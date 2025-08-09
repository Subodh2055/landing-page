import { Component, HostListener } from '@angular/core';
import { AuthController } from '../../controllers/auth.controller';
import { User } from '../../models/user.model';
import { MobileFilterService } from '../../services/mobile-filter.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isScrolled = false;
  currentUser: User | null = null;

  constructor(
    private authController: AuthController,
    private mobileFilterService: MobileFilterService
  ) {
    this.currentUser = this.authController.getCurrentUser();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 0;
  }

  isAuthenticated(): boolean {
    return this.authController.isAuthenticated();
  }

  hasRole(role: string): boolean {
    return this.authController.hasRole(role);
  }

  getUserInitials(): string {
    if (this.currentUser) {
      return this.currentUser.username.substring(0, 2).toUpperCase();
    }
    return 'GU';
  }

  logout(): void {
    this.authController.logout();
    this.currentUser = null;
  }

  onMobileFilterToggle(): void {
    this.mobileFilterService.toggleMobileFilter();
  }

  // Handle mobile dropdown close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      const dropdowns = document.querySelectorAll('.dropdown-menu.show');
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
      });
    }
  }
}
