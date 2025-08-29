export class Coupon {
  constructor(
    public id: number,
    public code: string,
    public name: string,
    public description: string,
    public type: 'percentage' | 'fixed' | 'free_shipping',
    public value: number,
    public minOrderAmount: number,
    public maxDiscount?: number,
    public validFrom?: Date,
    public validUntil?: Date,
    public usageLimit?: number,
    public usedCount: number = 0,
    public isActive: boolean = true,
    public applicableCategories: string[] = [],
    public applicableProducts: number[] = []
  ) {}

  isValid(): boolean {
    const now = new Date();
    
    if (!this.isActive) return false;
    
    if (this.validFrom && now < this.validFrom) return false;
    
    if (this.validUntil && now > this.validUntil) return false;
    
    if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
    
    return true;
  }

  canApplyToOrder(orderAmount: number): boolean {
    return orderAmount >= this.minOrderAmount;
  }

  isApplicableToCategory(category: string): boolean {
    if (this.applicableCategories.length === 0) return true;
    return this.applicableCategories.includes(category);
  }

  isApplicableToProduct(productId: number): boolean {
    if (this.applicableProducts.length === 0) return true;
    return this.applicableProducts.includes(productId);
  }

  calculateDiscount(orderAmount: number): number {
    if (!this.canApplyToOrder(orderAmount)) return 0;

    let discount = 0;
    
    if (this.type === 'percentage') {
      discount = (orderAmount * this.value) / 100;
    } else if (this.type === 'fixed') {
      discount = this.value;
    } else if (this.type === 'free_shipping') {
      // Free shipping discount (typically around NPR 100-200)
      discount = Math.min(orderAmount * 0.1, 200); // 10% of order or max NPR 200
    }

    // Apply max discount limit if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }

    return Math.min(discount, orderAmount); // Can't discount more than order amount
  }

  getDiscountText(): string {
    if (this.type === 'percentage') {
      return `${this.value}% OFF`;
    } else if (this.type === 'fixed') {
      return `NPR ${this.value} OFF`;
    } else if (this.type === 'free_shipping') {
      return 'FREE SHIPPING';
    }
    return 'DISCOUNT';
  }

  getFormattedValue(): string {
    if (this.type === 'percentage') {
      return `${this.value}%`;
    } else if (this.type === 'fixed') {
      return `NPR ${this.value}`;
    } else if (this.type === 'free_shipping') {
      return 'FREE';
    }
    return `${this.value}`;
  }

  getMinOrderText(): string {
    return `Min. order NPR ${this.minOrderAmount}`;
  }

  getValidityText(): string {
    if (this.validUntil) {
      const daysLeft = Math.ceil((this.validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) return 'Expired';
      if (daysLeft === 1) return 'Expires today';
      if (daysLeft <= 7) return `Expires in ${daysLeft} days`;
      return `Valid until ${this.validUntil.toLocaleDateString()}`;
    }
    return 'No expiry';
  }

  getUsageText(): string {
    if (this.usageLimit) {
      const remaining = this.usageLimit - this.usedCount;
      return `${remaining} uses remaining`;
    }
    return 'Unlimited uses';
  }

  incrementUsage(): void {
    this.usedCount++;
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
      validFrom: this.validFrom?.toISOString(),
      validUntil: this.validUntil?.toISOString(),
      usageLimit: this.usageLimit,
      usedCount: this.usedCount,
      isActive: this.isActive,
      applicableCategories: this.applicableCategories,
      applicableProducts: this.applicableProducts
    };
  }

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
      json.validFrom ? new Date(json.validFrom) : undefined,
      json.validUntil ? new Date(json.validUntil) : undefined,
      json.usageLimit,
      json.usedCount || 0,
      json.isActive !== false,
      json.applicableCategories || [],
      json.applicableProducts || []
    );
  }
}

export class CouponValidationResult {
  constructor(
    public isValid: boolean,
    public coupon?: Coupon,
    public message: string = '',
    public discountAmount: number = 0
  ) {}

  getFormattedDiscountAmount(): string {
    return `NPR ${this.discountAmount.toFixed(2)}`;
  }

  toJson(): any {
    return {
      isValid: this.isValid,
      coupon: this.coupon?.toJson(),
      message: this.message,
      discountAmount: this.discountAmount
    };
  }

  static fromJson(json: any): CouponValidationResult {
    return new CouponValidationResult(
      json.isValid,
      json.coupon ? Coupon.fromJson(json.coupon) : undefined,
      json.message,
      json.discountAmount || 0
    );
  }
}
