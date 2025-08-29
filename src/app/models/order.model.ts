import { Product } from './product.model';
import { Address } from './user-profile.model';

export class OrderItem {
  constructor(
    public id: string,
    public product: Product,
    public quantity: number,
    public price: number,
    public totalPrice: number
  ) {}

  getFormattedPrice(): string {
    return `NPR ${this.price.toFixed(2)}`;
  }

  getFormattedTotalPrice(): string {
    return `NPR ${this.totalPrice.toFixed(2)}`;
  }

  toJson(): any {
    return {
      id: this.id,
      product: this.product.toJson(),
      quantity: this.quantity,
      price: this.price,
      totalPrice: this.totalPrice
    };
  }

  static fromJson(json: any): OrderItem {
    return new OrderItem(
      json.id,
      Product.fromJson(json.product),
      json.quantity,
      json.price,
      json.totalPrice
    );
  }
}

export class Order {
  constructor(
    public id: string,
    public orderNumber: string,
    public userId: string,
    public items: OrderItem[],
    public status: OrderStatus,
    public subtotal: number,
    public tax: number,
    public shipping: number,
    public discount: number,
    public total: number,
    public shippingAddress: Address,
    public billingAddress: Address,
    public paymentMethod: string,
    public paymentStatus: PaymentStatus,
    public createdAt: Date,
    public updatedAt: Date,
    public estimatedDelivery?: Date,
    public trackingNumber?: string,
    public notes?: string
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

  getItemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getStatusText(): string {
    return this.status.replace(/_/g, ' ').toUpperCase();
  }

  getStatusColor(): string {
    switch (this.status) {
      case 'pending': return '#f39c12'; // Orange
      case 'confirmed': return '#3498db'; // Blue
      case 'processing': return '#9b59b6'; // Purple
      case 'shipped': return '#e67e22'; // Dark Orange
      case 'out_for_delivery': return '#e74c3c'; // Red
      case 'delivered': return '#27ae60'; // Green
      case 'cancelled': return '#95a5a6'; // Gray
      case 'returned': return '#34495e'; // Dark Gray
      default: return '#95a5a6';
    }
  }

  getPaymentStatusText(): string {
    return this.paymentStatus.replace(/_/g, ' ').toUpperCase();
  }

  getPaymentStatusColor(): string {
    switch (this.paymentStatus) {
      case 'pending': return '#f39c12';
      case 'paid': return '#27ae60';
      case 'failed': return '#e74c3c';
      case 'refunded': return '#3498db';
      default: return '#95a5a6';
    }
  }

  canCancel(): boolean {
    return ['pending', 'confirmed', 'processing'].includes(this.status);
  }

  canReturn(): boolean {
    return this.status === 'delivered';
  }

  getEstimatedDeliveryText(): string {
    if (!this.estimatedDelivery) return 'TBD';
    return this.estimatedDelivery.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  toJson(): any {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      userId: this.userId,
      items: this.items.map(item => item.toJson()),
      status: this.status,
      subtotal: this.subtotal,
      tax: this.tax,
      shipping: this.shipping,
      discount: this.discount,
      total: this.total,
      shippingAddress: this.shippingAddress.toJson(),
      billingAddress: this.billingAddress.toJson(),
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      estimatedDelivery: this.estimatedDelivery?.toISOString(),
      trackingNumber: this.trackingNumber,
      notes: this.notes
    };
  }

  static fromJson(json: any): Order {
    return new Order(
      json.id,
      json.orderNumber,
      json.userId,
      json.items?.map((item: any) => OrderItem.fromJson(item)) || [],
      json.status,
      json.subtotal,
      json.tax,
      json.shipping,
      json.discount,
      json.total,
      Address.fromJson(json.shippingAddress),
      Address.fromJson(json.billingAddress),
      json.paymentMethod,
      json.paymentStatus,
      new Date(json.createdAt),
      new Date(json.updatedAt),
      json.estimatedDelivery ? new Date(json.estimatedDelivery) : undefined,
      json.trackingNumber,
      json.notes
    );
  }
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export class OrderTracking {
  constructor(
    public orderId: string,
    public trackingNumber: string,
    public status: OrderStatus,
    public location: string,
    public description: string,
    public timestamp: Date,
    public estimatedDelivery?: Date
  ) {}

  getFormattedTimestamp(): string {
    return this.timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstimatedDeliveryText(): string {
    if (!this.estimatedDelivery) return 'TBD';
    return this.estimatedDelivery.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  toJson(): any {
    return {
      orderId: this.orderId,
      trackingNumber: this.trackingNumber,
      status: this.status,
      location: this.location,
      description: this.description,
      timestamp: this.timestamp.toISOString(),
      estimatedDelivery: this.estimatedDelivery?.toISOString()
    };
  }

  static fromJson(json: any): OrderTracking {
    return new OrderTracking(
      json.orderId,
      json.trackingNumber,
      json.status,
      json.location,
      json.description,
      new Date(json.timestamp),
      json.estimatedDelivery ? new Date(json.estimatedDelivery) : undefined
    );
  }
}

export class OrderReturn {
  constructor(
    public id: string,
    public orderId: string,
    public reason: string,
    public description: string,
    public status: 'pending' | 'approved' | 'rejected' | 'completed',
    public requestedAt: Date,
    public processedAt?: Date,
    public refundAmount?: number,
    public refundMethod?: string
  ) {}

  getFormattedRefundAmount(): string {
    if (!this.refundAmount) return 'TBD';
    return `NPR ${this.refundAmount.toFixed(2)}`;
  }

  getStatusText(): string {
    return this.status.toUpperCase();
  }

  getStatusColor(): string {
    switch (this.status) {
      case 'pending': return '#f39c12';
      case 'approved': return '#27ae60';
      case 'rejected': return '#e74c3c';
      case 'completed': return '#3498db';
      default: return '#95a5a6';
    }
  }

  toJson(): any {
    return {
      id: this.id,
      orderId: this.orderId,
      reason: this.reason,
      description: this.description,
      status: this.status,
      requestedAt: this.requestedAt.toISOString(),
      processedAt: this.processedAt?.toISOString(),
      refundAmount: this.refundAmount,
      refundMethod: this.refundMethod
    };
  }

  static fromJson(json: any): OrderReturn {
    return new OrderReturn(
      json.id,
      json.orderId,
      json.reason,
      json.description,
      json.status,
      new Date(json.requestedAt),
      json.processedAt ? new Date(json.processedAt) : undefined,
      json.refundAmount,
      json.refundMethod
    );
  }
}
