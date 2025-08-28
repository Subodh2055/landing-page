import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Order, OrderStatus, OrderTracking } from '../../models/order.model';
import { OrderTrackingService } from '../../services/order-tracking.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  order: Order | null = null;
  orderId: string = '';
  trackingNumber: string = '';
  loading = false;
  error = '';
  currentUser: any = null;

  // Status configuration
  statusConfig = {
    [OrderStatus.ORDER_PLACED]: {
      icon: 'fas fa-shopping-cart',
      color: '#4CAF50',
      title: 'Order Placed',
      description: 'Your order has been placed successfully'
    },
    [OrderStatus.PACKED]: {
      icon: 'fas fa-box',
      color: '#2196F3',
      title: 'Packed',
      description: 'Your order has been packed and is ready for shipping'
    },
    [OrderStatus.SHIPPED]: {
      icon: 'fas fa-shipping-fast',
      color: '#FF9800',
      title: 'Shipped',
      description: 'Your order has been shipped and is on its way'
    },
    [OrderStatus.OUT_FOR_DELIVERY]: {
      icon: 'fas fa-truck',
      color: '#9C27B0',
      title: 'Out for Delivery',
      description: 'Your order is out for delivery today'
    },
    [OrderStatus.DELIVERED]: {
      icon: 'fas fa-check-circle',
      color: '#4CAF50',
      title: 'Delivered',
      description: 'Your order has been delivered successfully'
    },
    [OrderStatus.CANCELLED]: {
      icon: 'fas fa-times-circle',
      color: '#F44336',
      title: 'Cancelled',
      description: 'Your order has been cancelled'
    },
    [OrderStatus.RETURNED]: {
      icon: 'fas fa-undo',
      color: '#607D8B',
      title: 'Returned',
      description: 'Your order has been returned'
    }
  };

  constructor(
    private orderTrackingService: OrderTrackingService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to route parameters
    this.route.params.subscribe(params => {
      this.orderId = params['orderId'] || '';
      this.trackingNumber = params['trackingNumber'] || '';
      
      if (this.orderId) {
        this.loadOrder(this.orderId);
      } else if (this.trackingNumber) {
        this.loadOrderByTrackingNumber(this.trackingNumber);
      }
    });

    // Subscribe to order updates
    this.orderTrackingService.orders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        if (this.orderId) {
          const updatedOrder = orders.find(order => order.id === this.orderId);
          if (updatedOrder) {
            this.order = updatedOrder;
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrder(orderId: string): void {
    this.loading = true;
    this.error = '';

    const order = this.orderTrackingService.getOrder(orderId);
    if (order) {
      this.order = order;
      this.loading = false;
    } else {
      this.error = 'Order not found';
      this.loading = false;
    }
  }

  private loadOrderByTrackingNumber(trackingNumber: string): void {
    this.loading = true;
    this.error = '';

    const order = this.orderTrackingService.getOrderByTrackingNumber(trackingNumber);
    if (order) {
      this.order = order;
      this.orderId = order.id;
      this.loading = false;
    } else {
      this.error = 'Order not found with this tracking number';
      this.loading = false;
    }
  }

  // Get status configuration
  getStatusConfig(status: OrderStatus) {
    return this.statusConfig[status] || this.statusConfig[OrderStatus.ORDER_PLACED];
  }

  // Get order progress percentage
  getOrderProgress(): number {
    if (!this.order) return 0;
    return this.orderTrackingService.getOrderProgress(this.order.id);
  }

  // Get estimated delivery date
  getEstimatedDelivery(): Date | null {
    if (!this.order) return null;
    return this.orderTrackingService.getEstimatedDelivery(this.order.id);
  }

  // Check if order is delivered
  isOrderDelivered(): boolean {
    if (!this.order) return false;
    return this.orderTrackingService.isOrderDelivered(this.order.id);
  }

  // Get formatted date
  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get time ago
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Get order total
  getOrderTotal(): number {
    return this.order ? this.order.total : 0;
  }

  // Get formatted total
  getFormattedTotal(): string {
    return `₹${this.getOrderTotal().toFixed(2)}`;
  }

  // Track by function for ngFor
  trackByTracking(index: number, tracking: OrderTracking): string {
    return tracking.timestamp.toISOString();
  }

  // Track by function for order items
  trackByOrderItem(index: number, item: any): number {
    return item.productId;
  }

  // Cancel order
  cancelOrder(): void {
    if (!this.order) return;

    const reason = prompt('Please provide a reason for cancellation:');
    if (reason !== null) {
      this.orderTrackingService.cancelOrder(this.order.id, reason);
    }
  }

  // Request return
  requestReturn(): void {
    if (!this.order) return;

    const reason = prompt('Please provide a reason for return:');
    if (reason !== null) {
      this.orderTrackingService.requestReturn(this.order.id, reason);
    }
  }

  // Simulate order progress (for demo)
  simulateProgress(): void {
    if (!this.order) return;
    this.orderTrackingService.simulateOrderProgress(this.order.id);
    this.toastr.info('Order progress simulated', 'Demo Mode');
  }

  // Navigate to orders list
  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }

  // Copy tracking number
  copyTrackingNumber(): void {
    if (!this.order?.trackingNumber) return;
    
    navigator.clipboard.writeText(this.order.trackingNumber);
    this.toastr.success('Tracking number copied to clipboard', 'Copied');
  }

  // Get status class for timeline
  getTimelineStatusClass(tracking: OrderTracking, index: number): string {
    if (!this.order) return '';
    
    const currentIndex = this.order.tracking.findIndex(t => t.status === this.order!.status);
    const trackingIndex = this.order.tracking.findIndex(t => t.timestamp === tracking.timestamp);
    
    if (trackingIndex < currentIndex) return 'completed';
    if (trackingIndex === currentIndex) return 'current';
    return 'pending';
  }

  // Get delivery status
  getDeliveryStatus(): string {
    if (!this.order) return '';
    
    switch (this.order.status) {
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Out for Delivery';
      case OrderStatus.SHIPPED:
        return 'In Transit';
      case OrderStatus.PACKED:
        return 'Ready for Shipping';
      case OrderStatus.ORDER_PLACED:
        return 'Processing';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      case OrderStatus.RETURNED:
        return 'Returned';
      default:
        return 'Unknown';
    }
  }

  // Get delivery status color
  getDeliveryStatusColor(): string {
    if (!this.order) return '#666';
    
    switch (this.order.status) {
      case OrderStatus.DELIVERED:
        return '#4CAF50';
      case OrderStatus.OUT_FOR_DELIVERY:
        return '#9C27B0';
      case OrderStatus.SHIPPED:
        return '#FF9800';
      case OrderStatus.PACKED:
        return '#2196F3';
      case OrderStatus.ORDER_PLACED:
        return '#4CAF50';
      case OrderStatus.CANCELLED:
        return '#F44336';
      case OrderStatus.RETURNED:
        return '#607D8B';
      default:
        return '#666';
    }
  }
}
