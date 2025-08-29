export class BannerPromotion {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public imageUrl: string,
    public linkUrl: string,
    public startDate: Date,
    public endDate: Date,
    public isActive: boolean = true,
    public priority: number = 1,
    public targetAudience: string[] = [],
    public discountCode?: string,
    public discountAmount?: number,
    public discountPercentage?: number,
    public backgroundColor: string = '#667eea',
    public textColor: string = '#ffffff',
    public position: 'top' | 'middle' | 'bottom' = 'top',
    public displayType: 'banner' | 'popup' | 'sidebar' = 'banner'
  ) {}

  isValid(): boolean {
    const now = new Date();
    return this.isActive && now >= this.startDate && now <= this.endDate;
  }

  isExpired(): boolean {
    const now = new Date();
    return now > this.endDate;
  }

  isUpcoming(): boolean {
    const now = new Date();
    return now < this.startDate;
  }

  getDaysRemaining(): number {
    if (this.isExpired()) return 0;
    
    const now = new Date();
    const endTime = this.endDate.getTime();
    const currentTime = now.getTime();
    const timeLeft = endTime - currentTime;
    
    return Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  }

  getFormattedDaysRemaining(): string {
    const days = this.getDaysRemaining();
    if (days === 0) return 'Expired';
    if (days === 1) return 'Expires today';
    if (days <= 7) return `Expires in ${days} days`;
    return `Valid for ${days} more days`;
  }

  getFormattedDiscount(): string {
    if (this.discountPercentage) {
      return `${this.discountPercentage}% OFF`;
    }
    if (this.discountAmount) {
      return `NPR ${this.discountAmount} OFF`;
    }
    return '';
  }

  getFormattedStartDate(): string {
    return this.startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFormattedEndDate(): string {
    return this.endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusText(): string {
    if (this.isExpired()) return 'Expired';
    if (this.isUpcoming()) return 'Upcoming';
    return 'Active';
  }

  getStatusColor(): string {
    if (this.isExpired()) return '#e74c3c'; // Red
    if (this.isUpcoming()) return '#f39c12'; // Orange
    return '#27ae60'; // Green
  }

  getPriorityText(): string {
    switch (this.priority) {
      case 1: return 'High Priority';
      case 2: return 'Medium Priority';
      case 3: return 'Low Priority';
      default: return 'Normal Priority';
    }
  }

  getPositionText(): string {
    switch (this.position) {
      case 'top': return 'Top Banner';
      case 'middle': return 'Middle Banner';
      case 'bottom': return 'Bottom Banner';
      default: return 'Banner';
    }
  }

  getDisplayTypeText(): string {
    switch (this.displayType) {
      case 'banner': return 'Banner';
      case 'popup': return 'Popup';
      case 'sidebar': return 'Sidebar';
      default: return 'Banner';
    }
  }

  isTargetedForUser(userCategories: string[]): boolean {
    if (this.targetAudience.length === 0) return true;
    return this.targetAudience.some(audience => userCategories.includes(audience));
  }

  getStyleObject(): any {
    return {
      backgroundColor: this.backgroundColor,
      color: this.textColor
    };
  }

  toJson(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      imageUrl: this.imageUrl,
      linkUrl: this.linkUrl,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      isActive: this.isActive,
      priority: this.priority,
      targetAudience: this.targetAudience,
      discountCode: this.discountCode,
      discountAmount: this.discountAmount,
      discountPercentage: this.discountPercentage,
      backgroundColor: this.backgroundColor,
      textColor: this.textColor,
      position: this.position,
      displayType: this.displayType
    };
  }

  static fromJson(json: any): BannerPromotion {
    return new BannerPromotion(
      json.id,
      json.title,
      json.description,
      json.imageUrl,
      json.linkUrl,
      new Date(json.startDate),
      new Date(json.endDate),
      json.isActive !== false,
      json.priority || 1,
      json.targetAudience || [],
      json.discountCode,
      json.discountAmount,
      json.discountPercentage,
      json.backgroundColor || '#667eea',
      json.textColor || '#ffffff',
      json.position || 'top',
      json.displayType || 'banner'
    );
  }
}

