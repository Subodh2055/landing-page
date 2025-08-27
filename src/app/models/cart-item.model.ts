import { Product } from './product.model';

export class CartItem {
  constructor(
    public id: number,
    public product: Product,
    public quantity: number,
    public addedAt: Date = new Date()
  ) {}

  static fromJson(json: any): CartItem {
    return new CartItem(
      json.id,
      Product.fromJson(json.product),
      json.quantity,
      new Date(json.addedAt)
    );
  }

  toJson(): any {
    return {
      id: this.id,
      product: this.product.toJson(),
      quantity: this.quantity,
      addedAt: this.addedAt.toISOString()
    };
  }

  getTotalPrice(): number {
    return this.product.price * this.quantity;
  }

  getFormattedTotalPrice(): string {
    return `₹${this.getTotalPrice().toFixed(2)}`;
  }

  getFormattedPrice(): string {
    return this.product.getFormattedPrice();
  }

  hasDiscount(): boolean {
    return this.product.hasDiscount();
  }

  getDiscountAmount(): number {
    if (!this.hasDiscount()) return 0;
    return (this.product.originalPrice! - this.product.price) * this.quantity;
  }

  getFormattedDiscountAmount(): string {
    return `₹${this.getDiscountAmount().toFixed(2)}`;
  }

  getSavingsPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(((this.product.originalPrice! - this.product.price) / this.product.originalPrice!) * 100);
  }

  isInStock(): boolean {
    return this.product.isInStock();
  }

  getStockStatus(): string {
    return this.product.getStockStatus();
  }

  canIncreaseQuantity(): boolean {
    return this.quantity < this.product.stock;
  }

  getMaxQuantity(): number {
    return this.product.stock;
  }
}
