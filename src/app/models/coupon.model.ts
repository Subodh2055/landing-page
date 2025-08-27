export class Coupon {
  constructor(
    public id: number,
    public code: string,
    public name: string,
    public description: string,
    public type: 'percentage' | 'fixed',
    public value: number,
    public minOrderAmount: number = 0,
    public maxDiscount: number = 0,
    public validFrom: Date = new Date(),
    public validUntil: Date = new Date(),
    public usageLimit: number = 0,
    public usedCount: number = 0,
    public isActive: boolean = true,
    public applicableCategories: string[] = [],
    public applicableProducts: number[] = []
  ) {}

  static fromJson(json: any): Coupon {
    return new Coupon(
      json.id,
      json.code,
      json.name,
      json.description,
      json.type,
      json.value,
      json.minOrderAmount,
      json.maxDiscount,
      new Date(json.validFrom),
      new Date(json.validUntil),
      json.usageLimit,
      json.usedCount,
      json.isActive,
      json.applicableCategories || [],
      json.applicableProducts || []
    );
  }

  toJson(): any {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      type: this.type,
      value: this.value,
      minOrderAmount: this.minOrderAmount,
      maxDiscount: this.maxDiscount,
      validFrom: this.validFrom.toISOString(),
      validUntil: this.validUntil.toISOString(),
      usageLimit: this.usageLimit,
      usedCount: this.usedCount,
      isActive: this.isActive,
      applicableCategories: this.applicableCategories,
      applicableProducts: this.applicableProducts
    };
  }

  isValid(): boolean {
    const now = new Date();
    return (
      this.isActive &&
      now >= this.validFrom &&
      now <= this.validUntil &&
      (this.usageLimit === 0 || this.usedCount < this.usageLimit)
    );
  }

  canApplyToOrder(orderAmount: number): boolean {
    return orderAmount >= this.minOrderAmount;
  }

  calculateDiscount(orderAmount: number): number {
    if (!this.canApplyToOrder(orderAmount)) {
      return 0;
    }

    let discount = 0;
    
    if (this.type === 'percentage') {
      discount = (orderAmount * this.value) / 100;
    } else {
      discount = this.value;
    }

    // Apply maximum discount limit
    if (this.maxDiscount > 0 && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }

    // Don't discount more than order amount
    if (discount > orderAmount) {
      discount = orderAmount;
    }

    return discount;
  }

  getDiscountText(): string {
    if (this.type === 'percentage') {
      return `${this.value}% OFF`;
    } else {
      return `₹${this.value} OFF`;
    }
  }

  getMinOrderText(): string {
    if (this.minOrderAmount > 0) {
      return `Min. order ₹${this.minOrderAmount}`;
    }
    return 'No minimum order';
  }

  getMaxDiscountText(): string {
    if (this.maxDiscount > 0) {
      return `Max. discount ₹${this.maxDiscount}`;
    }
    return '';
  }

  getValidityText(): string {
    const now = new Date();
    const daysLeft = Math.ceil((this.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) {
      return 'Expired';
    } else if (daysLeft === 1) {
      return 'Expires today';
    } else if (daysLeft <= 7) {
      return `Expires in ${daysLeft} days`;
    } else {
      return `Valid until ${this.validUntil.toLocaleDateString()}`;
    }
  }

  getUsageText(): string {
    if (this.usageLimit === 0) {
      return 'Unlimited usage';
    } else {
      const remaining = this.usageLimit - this.usedCount;
      return `${remaining} uses remaining`;
    }
  }

  isApplicableToCategory(category: string): boolean {
    return this.applicableCategories.length === 0 || this.applicableCategories.includes(category);
  }

  isApplicableToProduct(productId: number): boolean {
    return this.applicableProducts.length === 0 || this.applicableProducts.includes(productId);
  }

  getFormattedValue(): string {
    if (this.type === 'percentage') {
      return `${this.value}%`;
    } else {
      return `₹${this.value}`;
    }
  }

  getStatusColor(): string {
    if (!this.isValid()) {
      return '#e74c3c'; // Red for invalid
    } else if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
      return '#f39c12'; // Orange for usage limit reached
    } else {
      return '#27ae60'; // Green for valid
    }
  }
}
