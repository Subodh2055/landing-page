import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Order, OrderStatus } from '../../models/order.model';
import { OrderTrackingService } from '../../services/order-tracking.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  currentUser: any = null;
  
  // Filter properties
  searchTerm = '';
  statusFilter: OrderStatus | 'all' = 'all';
  dateFilter: 'all' | 'week' | 'month' | 'year' = 'all';
  
  // Statistics
  statistics = {
    total: 0,
    delivered: 0,
    inProgress: 0,
    cancelled: 0
  };

  // Status options for filter
  statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: OrderStatus.ORDER_PLACED, label: 'Order Placed' },
    { value: OrderStatus.PACKED, label: 'Packed' },
    { value: OrderStatus.SHIPPED, label: 'Shipped' },
    { value: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
    { value: OrderStatus.DELIVERED, label: 'Delivered' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' },
    { value: OrderStatus.RETURNED, label: 'Returned' }
  ];

  // Date filter options
  dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'year', label: 'Last Year' }
  ];

  constructor(
    private orderTrackingService: OrderTrackingService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadOrders();
    this.subscribeToOrderUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrders(): void {
    this.loading = true;
    
    if (this.currentUser) {
      this.orders = this.orderTrackingService.getUserOrders(this.currentUser.id);
      this.statistics = this.orderTrackingService.getOrderStatistics(this.currentUser.id);
      this.filterOrders();
    }
    
    this.loading = false;
  }

  private subscribeToOrderUpdates(): void {
    this.orderTrackingService.orders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        if (this.currentUser) {
          this.orders = this.orderTrackingService.getUserOrders(this.currentUser.id);
          this.statistics = this.orderTrackingService.getOrderStatistics(this.currentUser.id);
          this.filterOrders();
        }
      });
  }

  private filterOrders(): void {
    let filtered = [...this.orders];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Apply date filter
    if (this.dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (this.dateFilter) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(order => order.createdAt >= cutoffDate);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchLower)) ||
        order.trackingNumber?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredOrders = filtered;
  }

  // Filter methods
  onSearchChange(): void {
    this.filterOrders();
  }

  onStatusFilterChange(): void {
    this.filterOrders();
  }

  onDateFilterChange(): void {
    this.filterOrders();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.dateFilter = 'all';
    this.filterOrders();
  }

  // Navigation methods
  viewOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  trackOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId, 'track']);
  }

  // Utility methods
  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFormattedTotal(order: Order): string {
    return `₹${order.total.toFixed(2)}`;
  }

  getStatusConfig(status: OrderStatus) {
    const statusConfig = {
      [OrderStatus.ORDER_PLACED]: {
        icon: 'fas fa-shopping-cart',
        color: '#4CAF50',
        label: 'Order Placed'
      },
      [OrderStatus.PACKED]: {
        icon: 'fas fa-box',
        color: '#2196F3',
        label: 'Packed'
      },
      [OrderStatus.SHIPPED]: {
        icon: 'fas fa-shipping-fast',
        color: '#FF9800',
        label: 'Shipped'
      },
      [OrderStatus.OUT_FOR_DELIVERY]: {
        icon: 'fas fa-truck',
        color: '#9C27B0',
        label: 'Out for Delivery'
      },
      [OrderStatus.DELIVERED]: {
        icon: 'fas fa-check-circle',
        color: '#4CAF50',
        label: 'Delivered'
      },
      [OrderStatus.CANCELLED]: {
        icon: 'fas fa-times-circle',
        color: '#F44336',
        label: 'Cancelled'
      },
      [OrderStatus.RETURNED]: {
        icon: 'fas fa-undo',
        color: '#607D8B',
        label: 'Returned'
      }
    };

    return statusConfig[status] || statusConfig[OrderStatus.ORDER_PLACED];
  }

  getOrderProgress(order: Order): number {
    return this.orderTrackingService.getOrderProgress(order.id);
  }

  isOrderDelivered(order: Order): boolean {
    return this.orderTrackingService.isOrderDelivered(order.id);
  }

  getEstimatedDelivery(order: Order): Date | null {
    return this.orderTrackingService.getEstimatedDelivery(order.id);
  }

  // Track by functions
  trackByOrder(index: number, order: Order): string {
    return order.id;
  }

  trackByOrderItem(index: number, item: any): number {
    return item.productId;
  }

  // Action methods
  cancelOrder(order: Order): void {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason !== null) {
      this.orderTrackingService.cancelOrder(order.id, reason);
      this.toastr.warning('Order cancellation requested', 'Order Update');
    }
  }

  requestReturn(order: Order): void {
    const reason = prompt('Please provide a reason for return:');
    if (reason !== null) {
      this.orderTrackingService.requestReturn(order.id, reason);
      this.toastr.info('Return request submitted', 'Order Update');
    }
  }

  reorder(order: Order): void {
    // Add items to cart for reorder
    // This would typically add all items from the order to the cart
    this.toastr.success('Items added to cart for reorder', 'Reorder');
    this.router.navigate(['/cart']);
  }

  // Get order summary
  getOrderSummary(order: Order): string {
    const itemCount = order.items.length;
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (itemCount === 1) {
      return `${order.items[0].productName} (${totalItems} item)`;
    } else {
      return `${itemCount} items (${totalItems} total)`;
    }
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
}
