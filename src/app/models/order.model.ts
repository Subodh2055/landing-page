export enum OrderStatus {
  ORDER_PLACED = 'order_placed',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderTracking {
  status: OrderStatus;
  timestamp: Date;
  location?: string;
  description: string;
  estimatedDelivery?: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  tracking: OrderTracking[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
}

export interface OrderNotification {
  id: string;
  orderId: string;
  userId: string;
  type: 'email' | 'push' | 'sms';
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}
