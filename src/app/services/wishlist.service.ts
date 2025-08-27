import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { LocalStorageUtil } from '../utils/local-storage.util';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistKey = 'user_wishlist';
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(private localStorageUtil: LocalStorageUtil) {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    const wishlist = this.localStorageUtil.getItem<Product[]>(this.wishlistKey) || [];
    this.wishlistSubject.next(wishlist);
  }

  private saveWishlist(wishlist: Product[]): void {
    this.localStorageUtil.setItem(this.wishlistKey, wishlist);
    this.wishlistSubject.next(wishlist);
  }

  getWishlist(): Product[] {
    return this.wishlistSubject.value;
  }

  addToWishlist(product: Product): boolean {
    const wishlist = this.getWishlist();
    const exists = wishlist.find(item => item.id === product.id);
    
    if (!exists) {
      wishlist.push(product);
      this.saveWishlist(wishlist);
      return true;
    }
    return false;
  }

  removeFromWishlist(productId: number): boolean {
    const wishlist = this.getWishlist();
    const index = wishlist.findIndex(item => item.id === productId);
    
    if (index !== -1) {
      wishlist.splice(index, 1);
      this.saveWishlist(wishlist);
      return true;
    }
    return false;
  }

  isInWishlist(productId: number): boolean {
    return this.getWishlist().some(item => item.id === productId);
  }

  clearWishlist(): void {
    this.saveWishlist([]);
  }

  getWishlistCount(): number {
    return this.getWishlist().length;
  }

  moveToCart(productId: number): Product | null {
    const wishlist = this.getWishlist();
    const product = wishlist.find(item => item.id === productId);
    
    if (product) {
      this.removeFromWishlist(productId);
      return product;
    }
    return null;
  }
}
