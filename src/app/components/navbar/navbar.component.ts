import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
  isDesktopDropdownOpen = false;
  isMobileDropdownOpen = false;

  constructor(
    private authController: AuthController,
    private mobileFilterService: MobileFilterService,
    private router: Router,
    private toastr: ToastrService
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
    const username = this.currentUser?.username || 'User';
    
    // Show logout confirmation
    this.toastr.info('Logging you out...', 'Please Wait', {
      timeOut: 0,
      extendedTimeOut: 0,
      closeButton: false,
      progressBar: true
    });
    
    // Perform logout
    this.authController.logout();
    this.currentUser = null;
    this.closeAllDropdowns();
    
    // Clear loading toast and show success message
    setTimeout(() => {
      this.toastr.clear();
      this.toastr.success(
        `Goodbye, ${username}! You have been successfully logged out.`, 
        'Logout Successful',
        {
          timeOut: 4000,
          progressBar: true,
          closeButton: true,
          enableHtml: true
        }
      );
      
      // Navigate to products page
      this.router.navigate(['/products']);
    }, 1000);
  }

  onMobileFilterToggle(): void {
    this.mobileFilterService.toggleMobileFilter();
  }

  // Desktop dropdown methods
  toggleDesktopDropdown(): void {
    this.isDesktopDropdownOpen = !this.isDesktopDropdownOpen;
    this.isMobileDropdownOpen = false; // Close mobile dropdown
  }

  closeDesktopDropdown(): void {
    this.isDesktopDropdownOpen = false;
  }

  // Mobile dropdown methods
  toggleMobileDropdown(): void {
    this.isMobileDropdownOpen = !this.isMobileDropdownOpen;
    this.isDesktopDropdownOpen = false; // Close desktop dropdown
  }

  closeMobileDropdown(): void {
    this.isMobileDropdownOpen = false;
  }

  // Close all dropdowns
  closeAllDropdowns(): void {
    this.isDesktopDropdownOpen = false;
    this.isMobileDropdownOpen = false;
  }

  // Handle mobile dropdown close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
    // Close desktop dropdown if clicking outside
    if (!target.closest('.user-menu')) {
      this.closeDesktopDropdown();
    }
    
    // Close mobile dropdown if clicking outside
    if (!target.closest('.mobile-actions .dropdown')) {
      this.closeMobileDropdown();
    }
  }
}
