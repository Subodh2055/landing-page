import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { Observable, Subject, of } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductController } from '../../controllers/product.controller';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  searchResults$: Observable<Product[]> = new Observable();
  showSuggestions = false;
  showFilters = false;
  selectedFilters = {
    category: '',
    priceRange: { min: 0, max: 10000 },
    brand: '',
    rating: 0
  };
  
  categories: string[] = [];
  brands: string[] = [];
  priceRanges = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: 10000 }
  ];
  
  ratings = [4, 3, 2, 1];
  recommendedProducts: Product[] = [];
  recentlyViewed: Product[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(private productController: ProductController) {}

  ngOnInit(): void {
    this.initializeSearch();
    this.loadCategories();
    this.loadBrands();
    this.loadRecommendedProducts();
    this.loadRecentlyViewed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearch(): void {
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((value): value is string => value !== null && value.length >= 2),
      switchMap(value => this.searchProducts(value))
    );
  }

  private searchProducts(query: string): Observable<Product[]> {
    return this.productController.getProducts().pipe(
      switchMap(products => {
        const filtered = products.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );
        return of(filtered);
      })
    );
  }

  private loadCategories(): void {
    this.productController.getProducts().subscribe(products => {
      const categories = [...new Set(products.map(p => p.category))];
      this.categories = categories;
    });
  }

  private loadBrands(): void {
    this.productController.getProducts().subscribe(products => {
      const brands = [...new Set(products.map(p => p.brand || 'Unknown'))];
      this.brands = brands;
    });
  }

  private loadRecommendedProducts(): void {
    this.productController.getProducts().subscribe(products => {
      // Simple recommendation: random products
      this.recommendedProducts = products
        .sort(() => 0.5 - Math.random())
        .slice(0, 6);
    });
  }

  private loadRecentlyViewed(): void {
    const viewed = localStorage.getItem('recentlyViewed');
    if (viewed) {
      this.recentlyViewed = JSON.parse(viewed);
    }
  }

  onSearchFocus(): void {
    this.showSuggestions = true;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onFilterChange(): void {
    // Apply filters and update search results
    this.applyFilters();
  }

  private applyFilters(): void {
    const query = this.searchControl.value;
    if (query) {
      this.searchResults$ = this.productController.getProducts().pipe(
        switchMap(products => {
          let filtered = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
          );
          
          // Apply category filter
          if (this.selectedFilters.category) {
            filtered = filtered.filter(p => p.category === this.selectedFilters.category);
          }
          
          // Apply price filter
          filtered = filtered.filter(p => 
            p.price >= this.selectedFilters.priceRange.min && 
            p.price <= this.selectedFilters.priceRange.max
          );
          
          // Apply brand filter
          if (this.selectedFilters.brand) {
            filtered = filtered.filter(p => p.brand === this.selectedFilters.brand);
          }
          
          // Apply rating filter
          if (this.selectedFilters.rating > 0) {
            filtered = filtered.filter(p => p.rating >= this.selectedFilters.rating);
          }
          
          return of(filtered);
        })
      );
    }
  }

  onProductClick(product: Product): void {
    this.addToRecentlyViewed(product);
    this.showSuggestions = false;
  }

  private addToRecentlyViewed(product: Product): void {
    let viewed = this.recentlyViewed;
    viewed = viewed.filter(p => p.id !== product.id);
    viewed.unshift(product);
    viewed = viewed.slice(0, 10); // Keep only last 10
    this.recentlyViewed = viewed;
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
  }

  clearFilters(): void {
    this.selectedFilters = {
      category: '',
      priceRange: { min: 0, max: 10000 },
      brand: '',
      rating: 0
    };
    this.applyFilters();
  }
}
