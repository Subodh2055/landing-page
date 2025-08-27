import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthController } from '../../controllers/auth.controller';
import { User } from '../../models/user.model';
import { MobileFilterService } from '../../services/mobile-filter.service';
import { CartService } from '../../services/cart.service';
import { AuthStateService } from '../../services/auth-state.service';
import { SplashScreenService } from '../../services/splash-screen.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  currentUser: User | null = null;
  cartItemCount = 0;
  showUserMenu = false;
  showMobileUserMenu = false;
  
  private cartSubscription!: Subscription;
  private authSubscription!: Subscription;

  constructor(
    private authController: AuthController,
    private mobileFilterService: MobileFilterService,
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService,
    private authStateService: AuthStateService,
    private splashScreenService: SplashScreenService
  ) {
    this.currentUser = this.authController.getCurrentUser();
  }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getCartObservable().subscribe(cart => {
      this.cartItemCount = cart.totalItems;
    });
    
    // Subscribe to auth state changes
    this.authSubscription = this.authStateService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close menus when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container') && !target.closest('.mobile-user-menu')) {
      this.showUserMenu = false;
      this.showMobileUserMenu = false;
    }
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

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showMobileUserMenu = false; // Close mobile menu if open
  }

  toggleMobileUserMenu(): void {
    this.showMobileUserMenu = !this.showMobileUserMenu;
    this.showUserMenu = false; // Close desktop menu if open
  }

  logout(): void {
    const username = this.currentUser?.username || 'User';
    
    // Close menus
    this.showUserMenu = false;
    this.showMobileUserMenu = false;
    
    // Show logout confirmation
    this.toastr.info('Logging you out...', 'Please Wait', {
      timeOut: 0,
      extendedTimeOut: 0,
      closeButton: false,
      progressBar: true
    });
    
    // Perform logout
    this.authController.logout();
    
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

  showSplashScreen(): void {
    this.splashScreenService.showSplash();
    this.toastr.info('Splash screen activated!', 'Splash Screen', {
      timeOut: 2000
    });
  }
}
