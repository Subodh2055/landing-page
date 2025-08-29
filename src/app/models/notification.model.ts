export class Notification {
  constructor(
    public id: string,
    public userId: string,
    public type: NotificationType,
    public title: string,
    public message: string,
    public isRead: boolean = false,
    public isImportant: boolean = false,
    public actionUrl?: string,
    public actionText?: string,
    public metadata?: any,
    public createdAt: Date = new Date(),
    public readAt?: Date
  ) {}

  getTypeIcon(): string {
    switch (this.type) {
      case 'order_update': return '📦';
      case 'promotion': return '🎉';
      case 'price_drop': return '💰';
      case 'back_in_stock': return '✅';
      case 'delivery': return '🚚';
      case 'payment': return '💳';
      case 'review': return '⭐';
      case 'security': return '🔒';
      case 'system': return '⚙️';
      default: return '📢';
    }
  }

  getTypeColor(): string {
    switch (this.type) {
      case 'order_update': return '#3498db'; // Blue
      case 'promotion': return '#e74c3c'; // Red
      case 'price_drop': return '#27ae60'; // Green
      case 'back_in_stock': return '#f39c12'; // Orange
      case 'delivery': return '#9b59b6'; // Purple
      case 'payment': return '#1abc9c'; // Teal
      case 'review': return '#f1c40f'; // Yellow
      case 'security': return '#e67e22'; // Dark Orange
      case 'system': return '#95a5a6'; // Gray
      default: return '#34495e'; // Dark Gray
    }
  }

  getFormattedDate(): string {
    return this.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRelativeTime(): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return this.getFormattedDate();
  }

  markAsRead(): void {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date();
    }
  }

  markAsUnread(): void {
    this.isRead = false;
    this.readAt = undefined;
  }

  toggleImportant(): void {
    this.isImportant = !this.isImportant;
  }

  hasAction(): boolean {
    return !!this.actionUrl && !!this.actionText;
  }

  toJson(): any {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      isRead: this.isRead,
      isImportant: this.isImportant,
      actionUrl: this.actionUrl,
      actionText: this.actionText,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      readAt: this.readAt?.toISOString()
    };
  }

  static fromJson(json: any): Notification {
    return new Notification(
      json.id,
      json.userId,
      json.type,
      json.title,
      json.message,
      json.isRead || false,
      json.isImportant || false,
      json.actionUrl,
      json.actionText,
      json.metadata,
      new Date(json.createdAt),
      json.readAt ? new Date(json.readAt) : undefined
    );
  }
}

export type NotificationType = 
  | 'order_update'
  | 'promotion'
  | 'price_drop'
  | 'back_in_stock'
  | 'delivery'
  | 'payment'
  | 'review'
  | 'security'
  | 'system';

export class NotificationPreferences {
  constructor(
    public userId: string,
    public emailNotifications: boolean = true,
    public pushNotifications: boolean = true,
    public smsNotifications: boolean = false,
    public orderUpdates: boolean = true,
    public promotions: boolean = true,
    public priceDrops: boolean = true,
    public backInStock: boolean = true,
    public deliveryUpdates: boolean = true,
    public paymentUpdates: boolean = true,
    public reviewReminders: boolean = true,
    public securityAlerts: boolean = true,
    public systemUpdates: boolean = false,
    public quietHours: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    } = {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  ) {}

  isNotificationEnabled(type: NotificationType): boolean {
    switch (type) {
      case 'order_update': return this.orderUpdates;
      case 'promotion': return this.promotions;
      case 'price_drop': return this.priceDrops;
      case 'back_in_stock': return this.backInStock;
      case 'delivery': return this.deliveryUpdates;
      case 'payment': return this.paymentUpdates;
      case 'review': return this.reviewReminders;
      case 'security': return this.securityAlerts;
      case 'system': return this.systemUpdates;
      default: return true;
    }
  }

  isInQuietHours(): boolean {
    if (!this.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.parseTimeString(this.quietHours.startTime);
    const endTime = this.parseTimeString(this.quietHours.endTime);
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  toJson(): any {
    return {
      userId: this.userId,
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications,
      smsNotifications: this.smsNotifications,
      orderUpdates: this.orderUpdates,
      promotions: this.promotions,
      priceDrops: this.priceDrops,
      backInStock: this.backInStock,
      deliveryUpdates: this.deliveryUpdates,
      paymentUpdates: this.paymentUpdates,
      reviewReminders: this.reviewReminders,
      securityAlerts: this.securityAlerts,
      systemUpdates: this.systemUpdates,
      quietHours: this.quietHours
    };
  }

  static fromJson(json: any): NotificationPreferences {
    return new NotificationPreferences(
      json.userId,
      json.emailNotifications !== false,
      json.pushNotifications !== false,
      json.smsNotifications || false,
      json.orderUpdates !== false,
      json.promotions !== false,
      json.priceDrops !== false,
      json.backInStock !== false,
      json.deliveryUpdates !== false,
      json.paymentUpdates !== false,
      json.reviewReminders !== false,
      json.securityAlerts !== false,
      json.systemUpdates || false,
      json.quietHours || {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    );
  }
}

export class NotificationSummary {
  constructor(
    public userId: string,
    public totalCount: number,
    public unreadCount: number,
    public importantCount: number,
    public typeCounts: { [key in NotificationType]: number } = {
      order_update: 0,
      promotion: 0,
      price_drop: 0,
      back_in_stock: 0,
      delivery: 0,
      payment: 0,
      review: 0,
      security: 0,
      system: 0
    }
  ) {}

  getReadCount(): number {
    return this.totalCount - this.unreadCount;
  }

  getReadPercentage(): number {
    if (this.totalCount === 0) return 0;
    return Math.round((this.getReadCount() / this.totalCount) * 100);
  }

  getTypePercentage(type: NotificationType): number {
    if (this.totalCount === 0) return 0;
    return Math.round((this.typeCounts[type] / this.totalCount) * 100);
  }

  toJson(): any {
    return {
      userId: this.userId,
      totalCount: this.totalCount,
      unreadCount: this.unreadCount,
      importantCount: this.importantCount,
      typeCounts: this.typeCounts
    };
  }

  static fromJson(json: any): NotificationSummary {
    return new NotificationSummary(
      json.userId,
      json.totalCount || 0,
      json.unreadCount || 0,
      json.importantCount || 0,
      json.typeCounts || {
        order_update: 0,
        promotion: 0,
        price_drop: 0,
        back_in_stock: 0,
        delivery: 0,
        payment: 0,
        review: 0,
        security: 0,
        system: 0
      }
    );
  }
}
