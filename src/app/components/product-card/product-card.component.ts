import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showAdminActions: boolean = false;
  @Output() editProduct = new EventEmitter<Product>();
  @Output() deleteProduct = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();

  isInCart = false;
  cartQuantity = 0;
  loading = false;

  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router
  ) {
    // Subscribe to cart changes to update UI
    this.cartService.getCartObservable().subscribe(cart => {
      this.updateCartStatus();
    });
  }

  ngOnInit(): void {
    this.updateCartStatus();
  }

  private updateCartStatus(): void {
    const cartItem = this.cartService.getCartItem(this.product.id);
    this.isInCart = cartItem !== undefined;
    this.cartQuantity = cartItem?.quantity || 0;
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    
    if (!this.product.isInStock()) {
      this.toastr.warning('This product is out of stock!', 'Out of Stock');
      return;
    }

    this.loading = true;
    
    // Add to cart with animation delay
    setTimeout(() => {
      this.cartService.addToCart(this.product, 1);
      this.loading = false;
      
      const cartItem = this.cartService.getCartItem(this.product.id);
      if (cartItem && cartItem.quantity > 1) {
        this.toastr.success(`Added to cart! (${cartItem.quantity} in cart)`, 'Cart Updated');
      } else {
        this.toastr.success('Added to cart!', 'Success');
      }
    }, 300);
  }

  onBuyNow(event: Event): void {
    event.stopPropagation();
    
    if (!this.product.isInStock()) {
      this.toastr.warning('This product is out of stock!', 'Out of Stock');
      return;
    }

    this.loading = true;
    
    // Clear cart and add only this product
    this.cartService.clearCart();
    
    setTimeout(() => {
      this.cartService.addToCart(this.product, 1);
      this.loading = false;
      
      // Navigate to checkout
      this.router.navigate(['/checkout']);
      this.toastr.success('Redirecting to checkout...', 'Buy Now');
    }, 500);
  }

  onRemoveFromCart(event: Event): void {
    event.stopPropagation();
    
    this.loading = true;
    
    setTimeout(() => {
      this.cartService.removeFromCart(this.product.id);
      this.loading = false;
      this.toastr.info('Removed from cart', 'Cart Updated');
    }, 200);
  }

  onUpdateQuantity(event: Event, newQuantity: number): void {
    event.stopPropagation();
    
    if (newQuantity <= 0) {
      this.onRemoveFromCart(event);
      return;
    }

    this.loading = true;
    
    setTimeout(() => {
      this.cartService.updateQuantity(this.product.id, newQuantity);
      this.loading = false;
      this.toastr.success(`Quantity updated to ${newQuantity}`, 'Cart Updated');
    }, 200);
  }

  onQuickView(event: Event): void {
    event.stopPropagation();
    // Implement quick view modal functionality
    this.toastr.info('Quick view feature coming soon!', 'Feature Preview');
  }

  onAddToWishlist(event: Event): void {
    event.stopPropagation();
    this.addToWishlist.emit(this.product);
    this.toastr.success('Added to wishlist!', 'Wishlist');
  }

  onEditProduct(event: Event): void {
    event.stopPropagation();
    this.editProduct.emit(this.product);
  }

  onDeleteProduct(event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${this.product.name}"?`)) {
      this.deleteProduct.emit(this.product);
    }
  }

  // Get cart button text based on current state
  getCartButtonText(): string {
    if (this.loading) return 'Loading...';
    if (this.isInCart) return 'In Cart';
    return 'Add to Cart';
  }

  // Get buy now button text
  getBuyNowButtonText(): string {
    if (this.loading) return 'Loading...';
    return 'Buy Now';
  }

  // Check if product has discount
  hasDiscount(): boolean {
    return this.product.hasDiscount();
  }

  // Get discount percentage
  getDiscountPercentage(): number {
    return this.product.getDiscountPercentage();
  }

  // Get formatted price
  getFormattedPrice(): string {
    return this.product.getFormattedPrice();
  }

  // Get original price if discounted
  getOriginalPrice(): string {
    if (this.product.originalPrice) {
      return `$${this.product.originalPrice.toFixed(2)}`;
    }
    return '';
  }

  // Get stock status
  getStockStatus(): string {
    return this.product.getStockStatus();
  }

  // Get stock status class
  getStockStatusClass(): string {
    return this.product.isInStock() ? 'in-stock' : 'out-of-stock';
  }

  // Get rating stars
  getRatingStars(): string {
    return this.product.getRatingStars();
  }

  // Get formatted rating
  getFormattedRating(): string {
    return this.product.getFormattedRating();
  }

  // Check if user has admin role
  isAdmin(): boolean {
    return this.showAdminActions;
  }

  // Get role badge text
  getRoleBadgeText(): string {
    switch (this.product.role) {
      case 'admin':
        return 'Admin Only';
      case 'user':
        return 'User+';
      default:
        return 'Public';
    }
  }

  // Get role badge class
  getRoleBadgeClass(): string {
    switch (this.product.role) {
      case 'admin':
        return 'badge-admin';
      case 'user':
        return 'badge-user';
      default:
        return 'badge-public';
    }
  }

  // Handle image error
  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
  }
}
