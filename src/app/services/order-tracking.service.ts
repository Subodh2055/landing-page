import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { Order, OrderStatus, OrderTracking, OrderNotification } from '../models/order.model';
import { LocalStorageUtil } from '../utils/local-storage.util';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<OrderNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private readonly ORDERS_STORAGE_KEY = 'user_orders';
  private readonly NOTIFICATIONS_STORAGE_KEY = 'order_notifications';

  constructor(
    private localStorageUtil: LocalStorageUtil,
    private toastr: ToastrService
  ) {
    this.loadOrders();
    this.loadNotifications();
    this.startOrderTracking();
  }

  private loadOrders(): void {
    const orders = this.localStorageUtil.getItem<Order[]>(this.ORDERS_STORAGE_KEY) || [];
    this.ordersSubject.next(orders);
  }

  private loadNotifications(): void {
    const notifications = this.localStorageUtil.getItem<OrderNotification[]>(this.NOTIFICATIONS_STORAGE_KEY) || [];
    this.notificationsSubject.next(notifications);
  }

  private saveOrders(orders: Order[]): void {
    this.localStorageUtil.setItem(this.ORDERS_STORAGE_KEY, orders);
    this.ordersSubject.next(orders);
  }

  private saveNotifications(notifications: OrderNotification[]): void {
    this.localStorageUtil.setItem(this.NOTIFICATIONS_STORAGE_KEY, notifications);
    this.notificationsSubject.next(notifications);
  }

  // Create a new order
  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'tracking'>): Order {
    const order: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
      orderNumber: this.generateOrderNumber(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tracking: [{
        status: OrderStatus.ORDER_PLACED,
        timestamp: new Date(),
        description: 'Order has been placed successfully',
        estimatedDelivery: orderData.estimatedDelivery
      }]
    };

    const currentOrders = this.ordersSubject.value;
    this.saveOrders([...currentOrders, order]);

    // Send initial notification
    this.sendOrderNotification(order, 'Order Placed', 'Your order has been placed successfully!');

    return order;
  }

  // Get all orders for a user
  getUserOrders(userId: string): Order[] {
    return this.ordersSubject.value.filter(order => order.userId === userId);
  }

  // Get a specific order
  getOrder(orderId: string): Order | undefined {
    return this.ordersSubject.value.find(order => order.id === orderId);
  }

  // Get order by tracking number
  getOrderByTrackingNumber(trackingNumber: string): Order | undefined {
    return this.ordersSubject.value.find(order => order.trackingNumber === trackingNumber);
  }

  // Update order status
  updateOrderStatus(orderId: string, newStatus: OrderStatus, location?: string, notes?: string): void {
    const currentOrders = this.ordersSubject.value;
    const orderIndex = currentOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) return;

    const order = currentOrders[orderIndex];
    const trackingEntry: OrderTracking = {
      status: newStatus,
      timestamp: new Date(),
      location,
      description: this.getStatusDescription(newStatus),
      estimatedDelivery: order.estimatedDelivery
    };

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      tracking: [...order.tracking, trackingEntry],
      updatedAt: new Date(),
      notes: notes || order.notes
    };

    currentOrders[orderIndex] = updatedOrder;
    this.saveOrders(currentOrders);

    // Send notification for status update
    this.sendOrderNotification(updatedOrder, 'Order Update', this.getStatusNotificationMessage(newStatus));
  }

  // Simulate order progress (for demo purposes)
  simulateOrderProgress(orderId: string): void {
    const order = this.getOrder(orderId);
    if (!order) return;

    const statuses = [
      OrderStatus.PACKED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED
    ];

    let currentIndex = statuses.indexOf(order.status);
    if (currentIndex === -1) currentIndex = 0;

    if (currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      this.updateOrderStatus(orderId, nextStatus);
    }
  }

  // Get status description
  private getStatusDescription(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.ORDER_PLACED:
        return 'Your order has been placed and is being processed';
      case OrderStatus.PACKED:
        return 'Your order has been packed and is ready for shipping';
      case OrderStatus.SHIPPED:
        return 'Your order has been shipped and is on its way';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Your order is out for delivery today';
      case OrderStatus.DELIVERED:
        return 'Your order has been delivered successfully';
      case OrderStatus.CANCELLED:
        return 'Your order has been cancelled';
      case OrderStatus.RETURNED:
        return 'Your order has been returned';
      default:
        return 'Order status updated';
    }
  }

  // Get notification message
  private getStatusNotificationMessage(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.ORDER_PLACED:
        return 'Your order has been placed successfully!';
      case OrderStatus.PACKED:
        return 'Great news! Your order has been packed and is ready for shipping.';
      case OrderStatus.SHIPPED:
        return 'Your order is on its way! Track your package for real-time updates.';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'Your order is out for delivery today! Please be available to receive it.';
      case OrderStatus.DELIVERED:
        return 'Your order has been delivered successfully! Enjoy your purchase.';
      default:
        return 'Your order status has been updated.';
    }
  }

  // Send order notification
  private sendOrderNotification(order: Order, title: string, message: string): void {
    const notification: OrderNotification = {
      id: `notification_${Date.now()}`,
      orderId: order.id,
      userId: order.userId,
      type: 'push',
      title,
      message,
      status: 'sent',
      sentAt: new Date(),
      createdAt: new Date()
    };

    const currentNotifications = this.notificationsSubject.value;
    this.saveNotifications([...currentNotifications, notification]);

    // Show toast notification
    this.toastr.success(message, title, {
      timeOut: 5000,
      progressBar: true,
      closeButton: true
    });
  }

  // Get order tracking timeline
  getOrderTimeline(orderId: string): OrderTracking[] {
    const order = this.getOrder(orderId);
    return order ? order.tracking : [];
  }

  // Get order status progress percentage
  getOrderProgress(orderId: string): number {
    const order = this.getOrder(orderId);
    if (!order) return 0;

    const statuses = [
      OrderStatus.ORDER_PLACED,
      OrderStatus.PACKED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED
    ];

    const currentIndex = statuses.indexOf(order.status);
    if (currentIndex === -1) return 0;

    return ((currentIndex + 1) / statuses.length) * 100;
  }

  // Get estimated delivery time
  getEstimatedDelivery(orderId: string): Date | null {
    const order = this.getOrder(orderId);
    return order ? order.estimatedDelivery : null;
  }

  // Check if order is delivered
  isOrderDelivered(orderId: string): boolean {
    const order = this.getOrder(orderId);
    return order ? order.status === OrderStatus.DELIVERED : false;
  }

  // Get notifications for a user
  getUserNotifications(userId: string): OrderNotification[] {
    return this.notificationsSubject.value.filter(notification => notification.userId === userId);
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, status: 'sent' as const }
        : notification
    );
    this.saveNotifications(updatedNotifications);
  }

  // Clear old notifications
  clearOldNotifications(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(
      notification => notification.createdAt > cutoffDate
    );
    this.saveNotifications(filteredNotifications);
  }

  // Generate order number
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }

  // Start order tracking simulation
  private startOrderTracking(): void {
    // Simulate order updates every 30 seconds for demo purposes
    interval(30000).subscribe(() => {
      const orders = this.ordersSubject.value;
      orders.forEach(order => {
        if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED) {
          // 10% chance to update order status
          if (Math.random() < 0.1) {
            this.simulateOrderProgress(order.id);
          }
        }
      });
    });
  }

  // Get order statistics
  getOrderStatistics(userId: string): {
    total: number;
    delivered: number;
    inProgress: number;
    cancelled: number;
  } {
    const userOrders = this.getUserOrders(userId);
    
    return {
      total: userOrders.length,
      delivered: userOrders.filter(order => order.status === OrderStatus.DELIVERED).length,
      inProgress: userOrders.filter(order => 
        order.status !== OrderStatus.DELIVERED && 
        order.status !== OrderStatus.CANCELLED
      ).length,
      cancelled: userOrders.filter(order => order.status === OrderStatus.CANCELLED).length
    };
  }

  // Cancel order
  cancelOrder(orderId: string, reason?: string): void {
    const order = this.getOrder(orderId);
    if (!order || order.status === OrderStatus.DELIVERED) return;

    this.updateOrderStatus(orderId, OrderStatus.CANCELLED, undefined, reason);
    this.toastr.warning('Order has been cancelled', 'Order Cancelled');
  }

  // Request return
  requestReturn(orderId: string, reason: string): void {
    const order = this.getOrder(orderId);
    if (!order || order.status !== OrderStatus.DELIVERED) return;

    this.updateOrderStatus(orderId, OrderStatus.RETURNED, undefined, reason);
    this.toastr.info('Return request submitted', 'Return Requested');
  }
}
