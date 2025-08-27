export class Address {
  constructor(
    public id: number,
    public name: string,
    public phone: string,
    public addressLine1: string,
    public addressLine2?: string,
    public city: string = '',
    public state: string = '',
    public pincode: string = '',
    public country: string = 'India',
    public isDefault: boolean = false,
    public addressType: 'home' | 'work' | 'other' = 'home'
  ) {}

  static fromJson(json: any): Address {
    return new Address(
      json.id,
      json.name,
      json.phone,
      json.addressLine1,
      json.addressLine2,
      json.city,
      json.state,
      json.pincode,
      json.country,
      json.isDefault,
      json.addressType
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      state: this.state,
      pincode: this.pincode,
      country: this.country,
      isDefault: this.isDefault,
      addressType: this.addressType
    };
  }

  getFullAddress(): string {
    let address = this.addressLine1;
    
    if (this.addressLine2) {
      address += `, ${this.addressLine2}`;
    }
    
    if (this.city) {
      address += `, ${this.city}`;
    }
    
    if (this.state) {
      address += `, ${this.state}`;
    }
    
    if (this.pincode) {
      address += ` - ${this.pincode}`;
    }
    
    if (this.country && this.country !== 'India') {
      address += `, ${this.country}`;
    }
    
    return address;
  }

  getShortAddress(): string {
    let address = this.addressLine1;
    
    if (this.city) {
      address += `, ${this.city}`;
    }
    
    if (this.state) {
      address += `, ${this.state}`;
    }
    
    return address;
  }

  getAddressTypeIcon(): string {
    switch (this.addressType) {
      case 'home':
        return 'fas fa-home';
      case 'work':
        return 'fas fa-briefcase';
      default:
        return 'fas fa-map-marker-alt';
    }
  }

  getAddressTypeLabel(): string {
    switch (this.addressType) {
      case 'home':
        return 'Home';
      case 'work':
        return 'Work';
      default:
        return 'Other';
    }
  }

  isValid(): boolean {
    return !!(
      this.name &&
      this.phone &&
      this.addressLine1 &&
      this.city &&
      this.state &&
      this.pincode
    );
  }

  getFormattedPhone(): string {
    // Format Indian phone numbers
    const phone = this.phone.replace(/\D/g, '');
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    } else if (phone.length === 12 && phone.startsWith('91')) {
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return this.phone;
  }
}
