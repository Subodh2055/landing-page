export class FlashSale {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public discountPercentage: number,
    public originalPrice: number,
    public salePrice: number,
    public startTime: Date,
    public endTime: Date,
    public isActive: boolean = true,
    public applicableProducts: number[] = [],
    public applicableCategories: string[] = [],
    public maxUses: number = 0,
    public currentUses: number = 0,
    public countdown?: {
      hours: number;
      minutes: number;
      seconds: number;
    }
  ) {}

  isValid(): boolean {
    const now = new Date();
    return this.isActive && now >= this.startTime && now <= this.endTime;
  }

  isExpired(): boolean {
    const now = new Date();
    return now > this.endTime;
  }

  isUpcoming(): boolean {
    const now = new Date();
    return now < this.startTime;
  }

  getTimeRemaining(): { hours: number; minutes: number; seconds: number } | null {
    if (this.isExpired()) return null;
    
    const now = new Date();
    const endTime = this.endTime.getTime();
    const currentTime = now.getTime();
    const timeLeft = endTime - currentTime;
    
    if (timeLeft <= 0) return null;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }

  getFormattedTimeRemaining(): string {
    const timeLeft = this.getTimeRemaining();
    if (!timeLeft) return 'Expired';
    
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else {
      return `${timeLeft.seconds}s`;
    }
  }

  getFormattedOriginalPrice(): string {
    return `NPR ${this.originalPrice.toFixed(2)}`;
  }

  getFormattedSalePrice(): string {
    return `NPR ${this.salePrice.toFixed(2)}`;
  }

  getSavingsAmount(): number {
    return this.originalPrice - this.salePrice;
  }

  getFormattedSavings(): string {
    return `NPR ${this.getSavingsAmount().toFixed(2)}`;
  }

  getSavingsPercentage(): number {
    return ((this.originalPrice - this.salePrice) / this.originalPrice) * 100;
  }

  getFormattedSavingsPercentage(): string {
    return `${this.getSavingsPercentage().toFixed(0)}% OFF`;
  }

  canUse(): boolean {
    if (!this.isValid()) return false;
    if (this.maxUses > 0 && this.currentUses >= this.maxUses) return false;
    return true;
  }

  incrementUsage(): void {
    this.currentUses++;
  }

  getUsageText(): string {
    if (this.maxUses === 0) return 'Unlimited uses';
    const remaining = this.maxUses - this.currentUses;
    return `${remaining} uses remaining`;
  }

  getStatusText(): string {
    if (this.isExpired()) return 'Expired';
    if (this.isUpcoming()) return 'Upcoming';
    if (!this.canUse()) return 'Usage limit reached';
    return 'Active';
  }

  getStatusColor(): string {
    if (this.isExpired()) return '#e74c3c'; // Red
    if (this.isUpcoming()) return '#f39c12'; // Orange
    if (!this.canUse()) return '#95a5a6'; // Gray
    return '#27ae60'; // Green
  }

  toJson(): any {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      discountPercentage: this.discountPercentage,
      originalPrice: this.originalPrice,
      salePrice: this.salePrice,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      isActive: this.isActive,
      applicableProducts: this.applicableProducts,
      applicableCategories: this.applicableCategories,
      maxUses: this.maxUses,
      currentUses: this.currentUses,
      countdown: this.countdown
    };
  }

  static fromJson(json: any): FlashSale {
    return new FlashSale(
      json.id,
      json.title,
      json.description,
      json.discountPercentage,
      json.originalPrice,
      json.salePrice,
      new Date(json.startTime),
      new Date(json.endTime),
      json.isActive !== false,
      json.applicableProducts || [],
      json.applicableCategories || [],
      json.maxUses || 0,
      json.currentUses || 0,
      json.countdown
    );
  }
}

