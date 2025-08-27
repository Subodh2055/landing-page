import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../models/product.model';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  wishlistItems: Product[] = [];
  loading = false;
  totalItems = 0;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
    this.subscribeToWishlistChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWishlist(): void {
    this.loading = true;
    this.wishlistItems = this.wishlistService.getWishlist();
    this.totalItems = this.wishlistItems.length;
    this.loading = false;
  }

  private subscribeToWishlistChanges(): void {
    this.wishlistService.wishlist$
      .pipe(takeUntil(this.destroy$))
      .subscribe(wishlist => {
        this.wishlistItems = wishlist;
        this.totalItems = wishlist.length;
      });
  }

  removeFromWishlist(productId: number): void {
    const success = this.wishlistService.removeFromWishlist(productId);
    if (success) {
      this.toastr.success('Item removed from wishlist');
    } else {
      this.toastr.error('Failed to remove item from wishlist');
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.toastr.success('Item added to cart');
  }

  moveToCart(productId: number): void {
    const product = this.wishlistService.moveToCart(productId);
    if (product) {
      this.cartService.addToCart(product, 1);
      this.toastr.success('Item moved to cart');
    }
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist();
    this.toastr.success('Wishlist cleared');
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  getTotalValue(): number {
    return this.wishlistItems.reduce((total, item) => total + item.price, 0);
  }

  getFormattedTotal(): string {
    return `₹${this.getTotalValue().toFixed(2)}`;
  }

  trackByProduct(index: number, item: Product): number {
    return item.id;
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }
}
