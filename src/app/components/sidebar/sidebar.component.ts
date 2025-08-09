import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() availableCategories: string[] = [];
  @Input() selectedCategories: { [key: string]: boolean } = {};
  @Input() priceRange: { min: number; max: number } = { min: 0, max: 0 };
  @Input() maxPrice: number = 0;
  @Input() inStockOnly: boolean = false;
  @Input() sortBy: string = 'name';
  @Input() hasActiveFilters: boolean = false;
  @Input() isMobile: boolean = false;
  @Input() categoryCounts: { [key: string]: number } = {};

  @Output() categoryChange = new EventEmitter<{ category: string; checked: boolean }>();
  @Output() priceRangeChange = new EventEmitter<{ min: number; max: number }>();
  @Output() stockChange = new EventEmitter<boolean>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() removeCategory = new EventEmitter<string>();
  @Output() clearPrice = new EventEmitter<void>();
  @Output() removeStock = new EventEmitter<void>();

  constructor() {
    // Component constructor
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle input changes
  }

  onCategoryChange(category: string, checked: boolean): void {
    this.categoryChange.emit({ category, checked });
  }

  onPriceRangeChange(): void {
    this.priceRangeChange.emit(this.priceRange);
  }

  onStockChange(checked: boolean): void {
    this.stockChange.emit(checked);
  }

  onSortChange(sortBy: string): void {
    this.sortChange.emit(sortBy);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }

  onRemoveCategory(category: string): void {
    this.removeCategory.emit(category);
  }

  onClearPrice(): void {
    this.clearPrice.emit();
  }

  onRemoveStock(): void {
    this.removeStock.emit();
  }

  getSelectedCategories(): string[] {
    return Object.keys(this.selectedCategories).filter(category => this.selectedCategories[category]);
  }

  getCategoryCount(category: string): number {
    const count = this.categoryCounts[category] || 0;
    return count;
  }

  getCategoryCountsLength(): number {
    return Object.keys(this.categoryCounts).length;
  }
}
