export class Product {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public price: number,
    public category: string,
    public image: string,
    public stock: number,
    public rating: number = 0,
    public reviews: number = 0,
    public role: 'public' | 'user' | 'admin' = 'public',
    public originalPrice?: number,
    public brand?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static fromJson(json: any): Product {
    return new Product(
      json.id,
      json.name,
      json.description,
      json.price,
      json.category,
      json.image || json.imageUrl,
      json.stock,
      json.rating || 0,
      json.reviews || 0,
      json.role || 'public',
      json.originalPrice,
      json.brand,
      new Date(json.createdAt),
      new Date(json.updatedAt || json.createdAt)
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      image: this.image,
      stock: this.stock,
      rating: this.rating,
      reviews: this.reviews,
      role: this.role,
      originalPrice: this.originalPrice,
      brand: this.brand,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  isPublic(): boolean {
    return this.role === 'public';
  }

  isUserAccessible(): boolean {
    return this.role === 'public' || this.role === 'user';
  }

  isAdminAccessible(): boolean {
    return this.role === 'public' || this.role === 'user' || this.role === 'admin';
  }

  isInStock(): boolean {
    return this.stock > 0;
  }

  getFormattedPrice(): string {
    return `NPR ${this.price.toFixed(2)}`;
  }

  getStockStatus(): string {
    return this.isInStock() ? 'In Stock' : 'Out of Stock';
  }

  getRatingStars(): string {
    return '★'.repeat(Math.floor(this.rating)) + '☆'.repeat(5 - Math.floor(this.rating));
  }

  getFormattedRating(): string {
    return this.rating.toFixed(1);
  }

  getImageUrl(): string {
    return this.image || '';
  }

  hasDiscount(): boolean {
    return this.originalPrice ? this.originalPrice > this.price : false;
  }

  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(((this.originalPrice! - this.price) / this.originalPrice!) * 100);
  }

  isOnSale(): boolean {
    return this.hasDiscount();
  }

  getSavingsAmount(): number {
    if (!this.hasDiscount()) return 0;
    return this.originalPrice! - this.price;
  }

  getFormattedSavings(): string {
    const savings = this.getSavingsAmount();
    if (savings <= 0) return '';
    return `NPR ${savings.toFixed(2)}`;
  }

  getFormattedOriginalPrice(): string {
    if (!this.originalPrice) return '';
    return `NPR ${this.originalPrice.toFixed(2)}`;
  }

  getDiscountText(): string {
    const percentage = this.getDiscountPercentage();
    if (percentage <= 0) return '';
    return `${percentage}% OFF`;
  }
}
