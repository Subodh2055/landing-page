import { Product } from './product.model';

export class WishlistItem {
  constructor(
    public id: string,
    public userId: string,
    public product: Product,
    public addedAt: Date = new Date(),
    public notes?: string,
    public priority: 'low' | 'medium' | 'high' = 'medium'
  ) {}

  getFormattedPrice(): string {
    return this.product.getFormattedPrice();
  }

  getFormattedAddedDate(): string {
    return this.addedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPriorityText(): string {
    return this.priority.toUpperCase();
  }

  getPriorityColor(): string {
    switch (this.priority) {
      case 'high': return '#e74c3c'; // Red
      case 'medium': return '#f39c12'; // Orange
      case 'low': return '#27ae60'; // Green
      default: return '#95a5a6'; // Gray
    }
  }

  isOnSale(): boolean {
    return this.product.isOnSale();
  }

  getSavingsAmount(): number {
    return this.product.getSavingsAmount();
  }

  getFormattedSavings(): string {
    return this.product.getFormattedSavings();
  }

  toJson(): any {
    return {
      id: this.id,
      userId: this.userId,
      product: this.product.toJson(),
      addedAt: this.addedAt.toISOString(),
      notes: this.notes,
      priority: this.priority
    };
  }

  static fromJson(json: any): WishlistItem {
    return new WishlistItem(
      json.id,
      json.userId,
      Product.fromJson(json.product),
      new Date(json.addedAt),
      json.notes,
      json.priority || 'medium'
    );
  }
}

export class Wishlist {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public description?: string,
    public items: WishlistItem[] = [],
    public isPublic: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  getItemCount(): number {
    return this.items.length;
  }

  getTotalValue(): number {
    return this.items.reduce((total, item) => total + item.product.price, 0);
  }

  getFormattedTotalValue(): string {
    return `NPR ${this.getTotalValue().toFixed(2)}`;
  }

  getOnSaleItems(): WishlistItem[] {
    return this.items.filter(item => item.product.isOnSale());
  }

  getOnSaleCount(): number {
    return this.getOnSaleItems().length;
  }

  getTotalSavings(): number {
    return this.items.reduce((total, item) => total + item.getSavingsAmount(), 0);
  }

  getFormattedTotalSavings(): string {
    return `NPR ${this.getTotalSavings().toFixed(2)}`;
  }

  addItem(product: Product, notes?: string, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    const existingItem = this.items.find(item => item.product.id === product.id);
    if (!existingItem) {
      const newItem = new WishlistItem(
        this.generateId(),
        this.userId,
        product,
        new Date(),
        notes,
        priority
      );
      this.items.push(newItem);
      this.updatedAt = new Date();
    }
  }

  removeItem(productId: number): void {
    this.items = this.items.filter(item => item.product.id !== productId);
    this.updatedAt = new Date();
  }

  updateItemPriority(productId: number, priority: 'low' | 'medium' | 'high'): void {
    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      item.priority = priority;
      this.updatedAt = new Date();
    }
  }

  updateItemNotes(productId: number, notes: string): void {
    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      item.notes = notes;
      this.updatedAt = new Date();
    }
  }

  clear(): void {
    this.items = [];
    this.updatedAt = new Date();
  }

  sortByPriority(): void {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    this.items.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  sortByDateAdded(): void {
    this.items.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  }

  sortByPrice(): void {
    this.items.sort((a, b) => b.product.price - a.product.price);
  }

  sortByName(): void {
    this.items.sort((a, b) => a.product.name.localeCompare(b.product.name));
  }

  private generateId(): string {
    return 'wishlist-item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  toJson(): any {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      description: this.description,
      items: this.items.map(item => item.toJson()),
      isPublic: this.isPublic,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJson(json: any): Wishlist {
    return new Wishlist(
      json.id,
      json.userId,
      json.name,
      json.description,
      json.items?.map((item: any) => WishlistItem.fromJson(item)) || [],
      json.isPublic || false,
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}

export class WishlistShare {
  constructor(
    public id: string,
    public wishlistId: string,
    public sharedBy: string,
    public sharedWith: string,
    public permission: 'view' | 'edit' = 'view',
    public sharedAt: Date = new Date(),
    public expiresAt?: Date
  ) {}

  isValid(): boolean {
    if (this.expiresAt) {
      return new Date() < this.expiresAt;
    }
    return true;
  }

  getPermissionText(): string {
    return this.permission.toUpperCase();
  }

  getFormattedSharedDate(): string {
    return this.sharedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getExpiryText(): string {
    if (!this.expiresAt) return 'Never expires';
    const daysLeft = Math.ceil((this.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return 'Expired';
    if (daysLeft === 1) return 'Expires today';
    return `Expires in ${daysLeft} days`;
  }

  toJson(): any {
    return {
      id: this.id,
      wishlistId: this.wishlistId,
      sharedBy: this.sharedBy,
      sharedWith: this.sharedWith,
      permission: this.permission,
      sharedAt: this.sharedAt.toISOString(),
      expiresAt: this.expiresAt?.toISOString()
    };
  }

  static fromJson(json: any): WishlistShare {
    return new WishlistShare(
      json.id,
      json.wishlistId,
      json.sharedBy,
      json.sharedWith,
      json.permission || 'view',
      new Date(json.sharedAt),
      json.expiresAt ? new Date(json.expiresAt) : undefined
    );
  }
}
