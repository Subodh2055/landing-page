export class PaymentMethod {
  constructor(
    public id: string,
    public name: string,
    public icon: string,
    public description: string,
    public isAvailable: boolean = true,
    public processingFee: number = 0,
    public processingTime: string = 'Instant',
    public supportedCards?: string[],
    public supportedWallets?: string[]
  ) {}

  static fromJson(json: any): PaymentMethod {
    return new PaymentMethod(
      json.id,
      json.name,
      json.icon,
      json.description,
      json.isAvailable,
      json.processingFee,
      json.processingTime,
      json.supportedCards,
      json.supportedWallets
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      description: this.description,
      isAvailable: this.isAvailable,
      processingFee: this.processingFee,
      processingTime: this.processingTime,
      supportedCards: this.supportedCards,
      supportedWallets: this.supportedWallets
    };
  }

  getFormattedProcessingFee(): string {
    if (this.processingFee === 0) {
      return 'No fee';
    } else {
      return `₹${this.processingFee.toFixed(2)}`;
    }
  }

  getProcessingTimeText(): string {
    return this.processingTime;
  }

  getSupportedCardsText(): string {
    if (!this.supportedCards || this.supportedCards.length === 0) {
      return '';
    }
    return this.supportedCards.join(', ');
  }

  getSupportedWalletsText(): string {
    if (!this.supportedWallets || this.supportedWallets.length === 0) {
      return '';
    }
    return this.supportedWallets.join(', ');
  }

  getMethodType(): 'cod' | 'card' | 'upi' | 'wallet' | 'netbanking' {
    if (this.id.includes('cod')) return 'cod';
    if (this.id.includes('card')) return 'card';
    if (this.id.includes('upi')) return 'upi';
    if (this.id.includes('wallet')) return 'wallet';
    return 'netbanking';
  }

  getMethodColor(): string {
    switch (this.getMethodType()) {
      case 'cod':
        return '#27ae60'; // Green
      case 'card':
        return '#3498db'; // Blue
      case 'upi':
        return '#9b59b6'; // Purple
      case 'wallet':
        return '#f39c12'; // Orange
      default:
        return '#34495e'; // Dark gray
    }
  }

  getMethodBackgroundColor(): string {
    switch (this.getMethodType()) {
      case 'cod':
        return 'rgba(39, 174, 96, 0.1)';
      case 'card':
        return 'rgba(52, 152, 219, 0.1)';
      case 'upi':
        return 'rgba(155, 89, 182, 0.1)';
      case 'wallet':
        return 'rgba(243, 156, 18, 0.1)';
      default:
        return 'rgba(52, 73, 94, 0.1)';
    }
  }

  getMethodBorderColor(): string {
    switch (this.getMethodType()) {
      case 'cod':
        return 'rgba(39, 174, 96, 0.3)';
      case 'card':
        return 'rgba(52, 152, 219, 0.3)';
      case 'upi':
        return 'rgba(155, 89, 182, 0.3)';
      case 'wallet':
        return 'rgba(243, 156, 18, 0.3)';
      default:
        return 'rgba(52, 73, 94, 0.3)';
    }
  }

  isRecommended(): boolean {
    // COD is recommended for first-time users
    return this.id === 'cod';
  }

  getRecommendationText(): string {
    if (this.isRecommended()) {
      return 'Recommended';
    }
    return '';
  }

  getSecurityInfo(): string {
    switch (this.getMethodType()) {
      case 'cod':
        return 'Pay securely when you receive your order';
      case 'card':
        return 'Your card details are encrypted and secure';
      case 'upi':
        return 'Instant and secure UPI payment';
      case 'wallet':
        return 'Quick payment from your digital wallet';
      default:
        return 'Secure payment processing';
    }
  }

  getIconClass(): string {
    return this.icon;
  }

  getDisplayName(): string {
    return this.name;
  }

  getDisplayDescription(): string {
    return this.description;
  }

  isInstantPayment(): boolean {
    return this.processingTime.toLowerCase().includes('instant');
  }

  getPaymentAdvantages(): string[] {
    const advantages: string[] = [];
    
    if (this.processingFee === 0) {
      advantages.push('No processing fee');
    }
    
    if (this.isInstantPayment()) {
      advantages.push('Instant payment');
    }
    
    if (this.id === 'cod') {
      advantages.push('Pay on delivery');
      advantages.push('No upfront payment');
    }
    
    if (this.id === 'upi') {
      advantages.push('Quick and easy');
      advantages.push('No card details needed');
    }
    
    return advantages;
  }
}
