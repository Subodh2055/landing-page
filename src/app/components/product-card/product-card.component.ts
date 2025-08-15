import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../../models/product.model';
import { AuthController } from '../../controllers/auth.controller';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCartEvent = new EventEmitter<Product>();
  @Output() buyNowEvent = new EventEmitter<Product>();
  @Output() editProductEvent = new EventEmitter<Product>();
  @Output() deleteProductEvent = new EventEmitter<Product>();
  @Output() quickViewEvent = new EventEmitter<Product>();

  isInWishlist = false;
  isAdmin = false;

  constructor(
    private authController: AuthController,
    private toastr: ToastrService
  ) {
    this.checkAdminStatus();
  }

  ngOnInit(): void {
    this.checkAdminStatus();
  }

  private checkAdminStatus(): void {
    this.isAdmin = this.authController.hasRole('admin');
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
  }

  toggleWishlist(): void {
    this.isInWishlist = !this.isInWishlist;
    const message = this.isInWishlist ? 'Added to wishlist' : 'Removed from wishlist';
    this.toastr.info(message, 'Wishlist', {
      timeOut: 2000,
      progressBar: true
    });
  }

  quickView(): void {
    this.quickViewEvent.emit(this.product);
  }

  getStars(): Array<{filled: boolean}> {
    const stars = [];
    const rating = Math.floor(this.product.rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push({ filled: i <= rating });
    }
    
    return stars;
  }

  getDiscountPercentage(): number {
    if (!this.product.originalPrice || this.product.originalPrice <= this.product.price) {
      return 0;
    }
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  addToCart(): void {
    if (!this.product.isInStock()) {
      this.toastr.warning('This product is out of stock', 'Cannot Add to Cart');
      return;
    }
    
    this.addToCartEvent.emit(this.product);
    this.toastr.success(`${this.product.name} added to cart`, 'Cart Updated', {
      timeOut: 2000,
      progressBar: true
    });
  }

  buyNow(): void {
    if (!this.product.isInStock()) {
      this.toastr.warning('This product is out of stock', 'Cannot Buy Now');
      return;
    }
    
    this.buyNowEvent.emit(this.product);
  }

  editProduct(): void {
    this.editProductEvent.emit(this.product);
  }

  deleteProduct(): void {
    if (confirm(`Are you sure you want to delete "${this.product.name}"?`)) {
      this.deleteProductEvent.emit(this.product);
      this.toastr.info('Product deleted successfully', 'Product Management');
    }
  }
}
