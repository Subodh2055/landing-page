import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SplashScreenService } from '../../services/splash-screen.service';
import { AuthService } from '../../services/auth.service';
import { AuthStateService } from '../../services/auth-state.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { MobileFilterService } from '../../services/mobile-filter.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  showUserMenu = false;
  showMobileUserMenu = false;
  isAuthenticated = false;
  currentUser: any = null;
  isScrolled = false;
  cartItemCount = 0;
  wishlistCount = 0;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private splashScreenService: SplashScreenService,
    private authService: AuthService,
    private authStateService: AuthStateService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private mobileFilterService: MobileFilterService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authStateService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      console.log('Navbar - Authentication state changed:', {
        isAuthenticated: this.isAuthenticated,
        user: user ? user.username : null
      });
    });

    // Subscribe to cart changes
    this.cartService.getCartObservable().subscribe(cart => {
      this.cartItemCount = cart.totalItems;
    });

    // Subscribe to wishlist changes
    this.wishlistService.wishlist$.subscribe(wishlist => {
      this.wishlistCount = wishlist.length;
    });

    // Log initial authentication state
    this.logAuthStatus();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }

  private logAuthStatus(): void {
    const isAuth = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    console.log('Navbar - Initial Auth Status:', {
      isAuthenticated: isAuth,
      currentUser: user ? user.username : null,
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Close user menu if clicking outside
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
    
    // Close mobile user menu if clicking outside
    if (!target.closest('.mobile-user-dropdown')) {
      this.showMobileUserMenu = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showMobileUserMenu = false; // Close mobile menu when opening desktop menu
  }

  toggleMobileUserMenu(): void {
    this.showMobileUserMenu = !this.showMobileUserMenu;
    this.showUserMenu = false; // Close desktop menu when opening mobile menu
  }

  showSplashScreen(): void {
    this.splashScreenService.showSplash();
    this.toastr.info('Splash screen activated!', 'Info');
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.showMobileUserMenu = false;
    
    this.toastr.success('You have been logged out successfully.', 'Logout Successful');
    this.router.navigate(['/auth/login']);
  }

  getUserInitials(): string {
    if (this.currentUser && this.currentUser.username) {
      return this.currentUser.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getUserDisplayName(): string {
    if (this.currentUser && this.currentUser.username) {
      return this.currentUser.username;
    }
    return 'User';
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  onMobileFilterToggle(): void {
    this.mobileFilterService.toggleMobileFilter();
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  navigateToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
