import { Component, OnInit } from '@angular/core';
import { ProductController } from '../../controllers/product.controller';
import { Product } from '../../models/product.model';
import { AuthController } from '../../controllers/auth.controller';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  loading = false;
  currentUser: User | null = null;
  
  // Pagination properties
  currentPage = 1;
  pageSize = 50;
  totalPages = 1;
  startIndex = 0;
  endIndex = 0;
  
  // Search properties
  searchTerm = '';
  
  // Filter properties
  availableCategories: string[] = [];
  selectedCategories: { [key: string]: boolean } = {};
  priceRange = { min: 0, max: 0 };
  maxPrice = 0;
  inStockOnly = false;
  sortBy = 'name';

  constructor(
    private productController: ProductController,
    private authController: AuthController
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authController.getCurrentUser();
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    const role = this.currentUser?.role;
    this.productController.getProducts(role).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.initializeFilters();
        this.filterProducts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  private initializeFilters(): void {
    // Initialize categories
    this.availableCategories = [...new Set(this.products.map(p => p.category))].sort();
    this.availableCategories.forEach(category => {
      this.selectedCategories[category] = false;
    });

    // Initialize price range
    const prices = this.products.map(p => p.price);
    this.maxPrice = Math.max(...prices);
    this.priceRange.max = this.maxPrice;
  }

  private filterProducts(): void {
    let filtered = [...this.products];

    // Search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    const selectedCategories = this.getSelectedCategories();
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Price range filter
    if (this.priceRange.min > 0 || this.priceRange.max < this.maxPrice) {
      filtered = filtered.filter(product => {
        const price = product.price;
        return price >= (this.priceRange.min || 0) && price <= (this.priceRange.max || this.maxPrice);
      });
    }

    // Stock filter
    if (this.inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Sort products
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
    this.updatePagination();
  }

  private sortProducts(products: Product[]): Product[] {
    const sorted = [...products];
    
    switch (this.sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'date':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'date-desc':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return sorted;
    }
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
    
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.filteredProducts.length);
    
    this.paginatedProducts = this.filteredProducts.slice(this.startIndex, this.endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.filterProducts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.filterProducts();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getCategoryCount(category: string): number {
    return this.products.filter(p => p.category === category).length;
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

  hasRole(role: string): boolean {
    return this.authController.hasRole(role);
  }

  trackByProduct(index: number, product: Product): number {
    return product.id;
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
  }

  deleteProduct(product: Product): void {
    console.log('Delete product:', product);
  }
}
