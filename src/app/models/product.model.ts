export class Product {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public price: number,
    public category: string,
    public imageUrl: string,
    public stock: number,
    public role: 'public' | 'user' | 'admin',
    public createdAt: Date
  ) {}

  static fromJson(json: any): Product {
    return new Product(
      json.id,
      json.name,
      json.description,
      json.price,
      json.category,
      json.imageUrl,
      json.stock,
      json.role,
      new Date(json.createdAt)
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      imageUrl: this.imageUrl,
      stock: this.stock,
      role: this.role,
      createdAt: this.createdAt.toISOString()
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
    return `$${this.price.toFixed(2)}`;
  }

  getStockStatus(): string {
    return this.isInStock() ? 'In Stock' : 'Out of Stock';
  }
}
