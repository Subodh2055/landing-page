import { Product } from './product.model';

export class CartItem {
  constructor(
    public product: Product,
    public quantity: number,
    public addedAt: Date = new Date(),
    public savedForLater: boolean = false
  ) {}

  getTotalPrice(): number {
    return this.product.price * this.quantity;
  }

  getFormattedTotalPrice(): string {
    return `NPR ${this.getTotalPrice().toFixed(2)}`;
  }

  toJson(): any {
    return {
      product: this.product.toJson(),
      quantity: this.quantity,
      addedAt: this.addedAt.toISOString(),
      savedForLater: this.savedForLater
    };
  }

  static fromJson(json: any): CartItem {
    return new CartItem(
      Product.fromJson(json.product),
      json.quantity,
      new Date(json.addedAt),
      json.savedForLater || false
    );
  }
}

export class Cart {
  constructor(
    public items: CartItem[] = [],
    public savedForLater: CartItem[] = [],
    public totalItems: number = 0,
    public subtotal: number = 0,
    public tax: number = 0,
    public shipping: number = 0,
    public discount: number = 0,
    public total: number = 0,
    public deliveryEstimate?: DeliveryEstimate
  ) {}

  getFormattedSubtotal(): string {
    return `NPR ${this.subtotal.toFixed(2)}`;
  }

  getFormattedTax(): string {
    return `NPR ${this.tax.toFixed(2)}`;
  }

  getFormattedShipping(): string {
    return this.shipping === 0 ? 'Free' : `NPR ${this.shipping.toFixed(2)}`;
  }

  getFormattedDiscount(): string {
    return `NPR ${this.discount.toFixed(2)}`;
  }

  getFormattedTotal(): string {
    return `NPR ${this.total.toFixed(2)}`;
  }

  toJson(): any {
    return {
      items: this.items.map(item => item.toJson()),
      savedForLater: this.savedForLater.map(item => item.toJson()),
      totalItems: this.totalItems,
      subtotal: this.subtotal,
      tax: this.tax,
      shipping: this.shipping,
      discount: this.discount,
      total: this.total,
      deliveryEstimate: this.deliveryEstimate?.toJson()
    };
  }

  static fromJson(json: any): Cart {
    return new Cart(
      json.items?.map((item: any) => CartItem.fromJson(item)) || [],
      json.savedForLater?.map((item: any) => CartItem.fromJson(item)) || [],
      json.totalItems || 0,
      json.subtotal || 0,
      json.tax || 0,
      json.shipping || 0,
      json.discount || 0,
      json.total || 0,
      json.deliveryEstimate ? DeliveryEstimate.fromJson(json.deliveryEstimate) : undefined
    );
  }
}

export class DeliveryEstimate {
  constructor(
    public estimatedDate: Date,
    public deliveryTime: string,
    public isExpress: boolean = false,
    public cost: number = 0,
    public isFree: boolean = false
  ) {}

  getFormattedDate(): string {
    return this.estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedCost(): string {
    if (this.isFree) return 'Free';
    return `NPR ${this.cost.toFixed(2)}`;
  }

  toJson(): any {
    return {
      estimatedDate: this.estimatedDate.toISOString(),
      deliveryTime: this.deliveryTime,
      isExpress: this.isExpress,
      cost: this.cost,
      isFree: this.isFree
    };
  }

  static fromJson(json: any): DeliveryEstimate {
    return new DeliveryEstimate(
      new Date(json.estimatedDate),
      json.deliveryTime,
      json.isExpress || false,
      json.cost || 0,
      json.isFree || false
    );
  }
}

