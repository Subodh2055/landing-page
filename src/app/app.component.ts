import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProductController } from './controllers/product.controller';
import { Product } from './models/product.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Landing Page';
  
  // Sidebar visibility
  showSidebar = false;
  sidebarMinimized = false;
  
  // Filter properties
  availableCategories: string[] = [];
  selectedCategories: { [key: string]: boolean } = {};
  priceRange = { min: 0, max: 0 };
  maxPrice = 0;
  inStockOnly = false;
  sortBy = 'name';

  constructor(
    private router: Router,
    private productController: ProductController
  ) {}

  ngOnInit(): void {
    // Show sidebar only on product list page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showSidebar = event.url === '/' || event.url === '/products';
      if (this.showSidebar) {
        this.initializeFilters();
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarMinimized = !this.sidebarMinimized;
  }

  expandSidebar(): void {
    this.sidebarMinimized = false;
  }

  private initializeFilters(): void {
    // Get products to initialize categories and price range
    this.productController.getProducts().subscribe((products: Product[]) => {
      // Initialize categories
      this.availableCategories = [...new Set(products.map(p => p.category))].sort();
      this.availableCategories.forEach(category => {
        this.selectedCategories[category] = false;
      });

      // Initialize price range
      const prices = products.map(p => p.price);
      this.maxPrice = Math.max(...prices);
      this.priceRange.max = this.maxPrice;
    });
  }

  onFilterChange(): void {
    // Emit filter change event that product list can listen to
    // This will be handled by a service in a real implementation
    console.log('Filter changed:', {
      categories: this.getSelectedCategories(),
      priceRange: this.priceRange,
      inStockOnly: this.inStockOnly,
      sortBy: this.sortBy
    });
  }

  getCategoryCount(category: string): number {
    // This would be calculated from actual product data
    return 10; // Placeholder
  }

  getSelectedCategories(): string[] {
    return Object.keys(this.selectedCategories).filter(cat => this.selectedCategories[cat]);
  }

  hasActiveFilters(): boolean {
    return this.getSelectedCategories().length > 0 || 
           this.priceRange.min > 0 || 
           this.priceRange.max < this.maxPrice || 
           this.inStockOnly;
  }

  clearFilters(): void {
    this.selectedCategories = {};
    this.availableCategories.forEach(category => {
      this.selectedCategories[category] = false;
    });
    this.priceRange = { min: 0, max: this.maxPrice };
    this.inStockOnly = false;
    this.sortBy = 'name';
    this.onFilterChange();
  }

  removeCategoryFilter(category: string): void {
    this.selectedCategories[category] = false;
    this.onFilterChange();
  }

  clearPriceFilter(): void {
    this.priceRange = { min: 0, max: this.maxPrice };
    this.onFilterChange();
  }
}
