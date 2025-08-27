import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { LocalStorageUtil } from '../utils/local-storage.util';

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {
  private recentlyViewedKey = 'recently_viewed_products';
  private maxItems = 20;
  private recentlyViewedSubject = new BehaviorSubject<Product[]>([]);
  public recentlyViewed$ = this.recentlyViewedSubject.asObservable();

  constructor(private localStorageUtil: LocalStorageUtil) {
    this.loadRecentlyViewed();
  }

  private loadRecentlyViewed(): void {
    const recentlyViewed = this.localStorageUtil.getItem<Product[]>(this.recentlyViewedKey) || [];
    this.recentlyViewedSubject.next(recentlyViewed);
  }

  private saveRecentlyViewed(products: Product[]): void {
    this.localStorageUtil.setItem(this.recentlyViewedKey, products);
    this.recentlyViewedSubject.next(products);
  }

  addToRecentlyViewed(product: Product): void {
    const recentlyViewed = this.getRecentlyViewed();
    
    // Remove if already exists
    const existingIndex = recentlyViewed.findIndex(item => item.id === product.id);
    if (existingIndex !== -1) {
      recentlyViewed.splice(existingIndex, 1);
    }
    
    // Add to beginning
    recentlyViewed.unshift(product);
    
    // Keep only max items
    if (recentlyViewed.length > this.maxItems) {
      recentlyViewed.splice(this.maxItems);
    }
    
    this.saveRecentlyViewed(recentlyViewed);
  }

  getRecentlyViewed(): Product[] {
    return this.recentlyViewedSubject.value;
  }

  getRecentlyViewedCount(): number {
    return this.getRecentlyViewed().length;
  }

  clearRecentlyViewed(): void {
    this.saveRecentlyViewed([]);
  }

  removeFromRecentlyViewed(productId: number): void {
    const recentlyViewed = this.getRecentlyViewed();
    const filtered = recentlyViewed.filter(item => item.id !== productId);
    this.saveRecentlyViewed(filtered);
  }

  getRecentlyViewedByCategory(category: string): Product[] {
    return this.getRecentlyViewed().filter(product => product.category === category);
  }
}
