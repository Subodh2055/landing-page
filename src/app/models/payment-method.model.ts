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

  isInstantPayment(): boolean {
    return this.processingTime.toLowerCase().includes('instant') || 
           this.processingTime.toLowerCase().includes('real-time');
  }

  isRecommended(): boolean {
    // Recommend free and instant payment methods
    return this.processingFee === 0 && this.isInstantPayment();
  }

  getFormattedProcessingFee(): string {
    if (this.processingFee === 0) return 'Free';
    if (this.processingFee < 1) {
      return `${(this.processingFee * 100).toFixed(1)}%`;
    }
    return `NPR ${this.processingFee.toFixed(2)}`;
  }

  getProcessingTimeText(): string {
    return this.processingTime;
  }

  getSupportedCardsText(): string {
    if (!this.supportedCards || this.supportedCards.length === 0) return '';
    return this.supportedCards.join(', ');
  }

  getSupportedWalletsText(): string {
    if (!this.supportedWallets || this.supportedWallets.length === 0) return '';
    return this.supportedWallets.join(', ');
  }

  getPaymentAdvantages(): string[] {
    const advantages: string[] = [];
    
    if (this.processingFee === 0) {
      advantages.push('No processing fee');
    }
    
    if (this.isInstantPayment()) {
      advantages.push('Instant payment');
    }
    
    if (this.supportedCards && this.supportedCards.length > 0) {
      advantages.push('Multiple card support');
    }
    
    if (this.supportedWallets && this.supportedWallets.length > 0) {
      advantages.push('Digital wallet support');
    }
    
    // Nepali payment method specific advantages
    if (this.id === 'khalti') {
      advantages.push('Nepal\'s leading payment gateway');
      advantages.push('Wide merchant network');
    }
    
    if (this.id === 'esewa') {
      advantages.push('Trusted digital payment platform');
      advantages.push('Government approved');
    }
    
    if (this.id === 'nepalpay') {
      advantages.push('National Payment Switch');
      advantages.push('QR code payments');
    }
    
    return advantages;
  }

  calculateProcessingFee(amount: number): number {
    if (this.processingFee === 0) return 0;
    
    if (this.processingFee < 1) {
      // Percentage-based fee
      return (amount * this.processingFee);
    }
    
    // Fixed fee
    return this.processingFee;
  }

  getTotalWithProcessingFee(amount: number): number {
    return amount + this.calculateProcessingFee(amount);
  }

  getFormattedTotalWithFee(amount: number): string {
    const total = this.getTotalWithProcessingFee(amount);
    return `NPR ${total.toFixed(2)}`;
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

  static fromJson(json: any): PaymentMethod {
    return new PaymentMethod(
      json.id,
      json.name,
      json.icon,
      json.description,
      json.isAvailable !== false,
      json.processingFee || 0,
      json.processingTime || 'Instant',
      json.supportedCards,
      json.supportedWallets
    );
  }
}

export class PaymentValidationResult {
  constructor(
    public isValid: boolean,
    public message: string = '',
    public processingFee: number = 0
  ) {}

  getFormattedProcessingFee(): string {
    if (this.processingFee === 0) return 'Free';
    return `NPR ${this.processingFee.toFixed(2)}`;
  }

  toJson(): any {
    return {
      isValid: this.isValid,
      message: this.message,
      processingFee: this.processingFee
    };
  }

  static fromJson(json: any): PaymentValidationResult {
    return new PaymentValidationResult(
      json.isValid,
      json.message,
      json.processingFee || 0
    );
  }
}
