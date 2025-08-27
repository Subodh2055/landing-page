import { Component, OnInit } from '@angular/core';
import { DataInitializerService } from './services/data-initializer.service';
import { SplashScreenService } from './services/splash-screen.service';
import { AuthService } from './services/auth.service';
import { AuthStateService } from './services/auth-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'landing-page';

  constructor(
    private dataInitializer: DataInitializerService,
    private splashScreenService: SplashScreenService,
    private authService: AuthService,
    private authStateService: AuthStateService
  ) {}

  ngOnInit(): void {
    // Show splash screen initially
    this.splashScreenService.showSplash();
    
    // Initialize default data for deployed application
    this.dataInitializer.initializeDefaultData();
    
    // Log storage info for debugging
    const storageInfo = this.dataInitializer.getStorageInfo();
    console.log('Storage Info:', storageInfo);
    
    // Log authentication state for debugging
    const isAuthenticated = this.authService.isAuthenticated();
    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    console.log('Authentication State:', {
      isAuthenticated,
      currentUser: currentUser ? currentUser.username : null,
      hasToken: !!token
    });
    
    // Hide splash screen after initialization
    setTimeout(() => {
      this.splashScreenService.hideSplash();
    }, 2000);
  }

  onMobileFilterToggle(): void {
    // This will be handled by the product list component
    console.log('Mobile filter toggle from navbar');
  }
}
