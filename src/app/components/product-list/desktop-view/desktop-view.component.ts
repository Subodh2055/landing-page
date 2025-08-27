import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-desktop-view',
  templateUrl: './desktop-view.component.html',
  styleUrls: ['./desktop-view.component.scss']
})
export class DesktopViewComponent {
  constructor(private router: Router) {}
  @Input() products: Product[] = [];
  @Input() paginatedProducts: Product[] = [];
  @Input() loading: boolean = false;
  @Input() currentUser: any = null;
  @Input() searchTerm: string = '';
  @Input() startIndex: number = 0;
  @Input() endIndex: number = 0;
  @Input() filteredProducts: Product[] = [];
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Input() hasActiveFilters: () => boolean = () => false;
  @Input() availableCategories: string[] = [];
  @Input() selectedCategories: { [key: string]: boolean } = {};
  @Input() priceRange: { min: number; max: number } = { min: 0, max: 1000 };
  @Input() maxPrice: number = 1000;
  @Input() inStockOnly: boolean = false;
  @Input() sortBy: string = 'name';

  @Output() searchChange = new EventEmitter<void>();
  @Output() goToPage = new EventEmitter<number>();
  @Output() categoryChange = new EventEmitter<{ category: string; checked: boolean }>();
  @Output() priceRangeChange = new EventEmitter<{ min: number; max: number }>();
  @Output() stockChange = new EventEmitter<boolean>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() removeCategoryFilter = new EventEmitter<string>();
  @Output() clearPriceFilter = new EventEmitter<void>();
  @Output() removeStockFilter = new EventEmitter<void>();

  trackByProduct(index: number, product: Product): number {
    return product.id;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles?.includes(role) || false;
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  onSearchChange(): void {
    this.searchChange.emit();
  }

  onGoToPage(page: number): void {
    this.goToPage.emit(page);
  }

  onCategoryChange(event: { category: string; checked: boolean }): void {
    this.categoryChange.emit(event);
  }

  onPriceRangeChange(range: { min: number; max: number }): void {
    this.priceRangeChange.emit(range);
  }

  onStockChange(checked: boolean): void {
    this.stockChange.emit(checked);
  }

  onSortChange(sortBy: string): void {
    this.sortChange.emit(sortBy);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  onRemoveCategoryFilter(category: string): void {
    this.removeCategoryFilter.emit(category);
  }

  onClearPriceFilter(): void {
    this.clearPriceFilter.emit();
  }

  onRemoveStockFilter(): void {
    this.removeStockFilter.emit();
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
