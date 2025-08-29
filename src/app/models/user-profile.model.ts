export class UserProfile {
  constructor(
    public id: string,
    public userId: string,
    public personalDetails: PersonalDetails,
    public addresses: Address[] = [],
    public preferences: UserPreferences = new UserPreferences(),
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  getFullName(): string {
    return `${this.personalDetails.firstName} ${this.personalDetails.lastName}`;
  }

  getDefaultAddress(): Address | undefined {
    return this.addresses.find(addr => addr.isDefault);
  }

  toJson(): any {
    return {
      id: this.id,
      userId: this.userId,
      personalDetails: this.personalDetails.toJson(),
      addresses: this.addresses.map(addr => addr.toJson()),
      preferences: this.preferences.toJson(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJson(json: any): UserProfile {
    return new UserProfile(
      json.id,
      json.userId,
      PersonalDetails.fromJson(json.personalDetails),
      json.addresses?.map((addr: any) => Address.fromJson(addr)) || [],
      UserPreferences.fromJson(json.preferences),
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}

export class PersonalDetails {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
    public phone: string,
    public dateOfBirth?: Date,
    public gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say',
    public profilePicture?: string,
    public bio?: string
  ) {}

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getInitials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }

  getAge(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  toJson(): any {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth?.toISOString(),
      gender: this.gender,
      profilePicture: this.profilePicture,
      bio: this.bio
    };
  }

  static fromJson(json: any): PersonalDetails {
    return new PersonalDetails(
      json.firstName,
      json.lastName,
      json.email,
      json.phone,
      json.dateOfBirth ? new Date(json.dateOfBirth) : undefined,
      json.gender,
      json.profilePicture,
      json.bio
    );
  }
}

export class Address {
  constructor(
    public id: string,
    public type: 'home' | 'work' | 'other',
    public isDefault: boolean,
    public firstName: string,
    public lastName: string,
    public company?: string,
    public addressLine1: string = '',
    public addressLine2?: string,
    public city: string = '',
    public state: string = '',
    public postalCode: string = '',
    public country: string = 'Nepal',
    public phone: string = '',
    public instructions?: string
  ) {}

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getFullAddress(): string {
    let address = this.addressLine1;
    if (this.addressLine2) address += `, ${this.addressLine2}`;
    address += `, ${this.city}`;
    if (this.state) address += `, ${this.state}`;
    address += `, ${this.postalCode}`;
    if (this.country) address += `, ${this.country}`;
    return address;
  }

  getFormattedPhone(): string {
    // Format Nepali phone number
    const phone = this.phone.replace(/\D/g, '');
    if (phone.length === 10) {
      return `+977 ${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}`;
    }
    return this.phone;
  }

  toJson(): any {
    return {
      id: this.id,
      type: this.type,
      isDefault: this.isDefault,
      firstName: this.firstName,
      lastName: this.lastName,
      company: this.company,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      phone: this.phone,
      instructions: this.instructions
    };
  }

  static fromJson(json: any): Address {
    return new Address(
      json.id,
      json.type,
      json.isDefault || false,
      json.firstName,
      json.lastName,
      json.company,
      json.addressLine1,
      json.addressLine2,
      json.city,
      json.state,
      json.postalCode,
      json.country,
      json.phone,
      json.instructions
    );
  }
}

export class UserPreferences {
  constructor(
    public emailNotifications: boolean = true,
    public smsNotifications: boolean = true,
    public pushNotifications: boolean = true,
    public marketingEmails: boolean = false,
    public language: string = 'en',
    public currency: string = 'NPR',
    public timezone: string = 'Asia/Kathmandu',
    public theme: 'light' | 'dark' | 'auto' = 'light'
  ) {}

  toJson(): any {
    return {
      emailNotifications: this.emailNotifications,
      smsNotifications: this.smsNotifications,
      pushNotifications: this.pushNotifications,
      marketingEmails: this.marketingEmails,
      language: this.language,
      currency: this.currency,
      timezone: this.timezone,
      theme: this.theme
    };
  }

  static fromJson(json: any): UserPreferences {
    return new UserPreferences(
      json.emailNotifications !== false,
      json.smsNotifications !== false,
      json.pushNotifications !== false,
      json.marketingEmails || false,
      json.language || 'en',
      json.currency || 'NPR',
      json.timezone || 'Asia/Kathmandu',
      json.theme || 'light'
    );
  }
}

export class ProfileUpdateRequest {
  constructor(
    public personalDetails?: Partial<PersonalDetails>,
    public addresses?: Address[],
    public preferences?: Partial<UserPreferences>
  ) {}

  toJson(): any {
    return {
      personalDetails: this.personalDetails,
      addresses: this.addresses?.map(addr => addr.toJson()),
      preferences: this.preferences
    };
  }

  static fromJson(json: any): ProfileUpdateRequest {
    return new ProfileUpdateRequest(
      json.personalDetails,
      json.addresses?.map((addr: any) => Address.fromJson(addr)),
      json.preferences
    );
  }
}

export class AddressFormData {
  constructor(
    public type: 'home' | 'work' | 'other' = 'home',
    public isDefault: boolean = false,
    public firstName: string = '',
    public lastName: string = '',
    public company: string = '',
    public addressLine1: string = '',
    public addressLine2: string = '',
    public city: string = '',
    public state: string = '',
    public postalCode: string = '',
    public country: string = 'Nepal',
    public phone: string = '',
    public instructions: string = ''
  ) {}

  toJson(): any {
    return {
      type: this.type,
      isDefault: this.isDefault,
      firstName: this.firstName,
      lastName: this.lastName,
      company: this.company,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      phone: this.phone,
      instructions: this.instructions
    };
  }

  static fromJson(json: any): AddressFormData {
    return new AddressFormData(
      json.type,
      json.isDefault,
      json.firstName,
      json.lastName,
      json.company,
      json.addressLine1,
      json.addressLine2,
      json.city,
      json.state,
      json.postalCode,
      json.country,
      json.phone,
      json.instructions
    );
  }
}

export class ChangePasswordRequest {
  constructor(
    public currentPassword: string = '',
    public newPassword: string = '',
    public confirmPassword: string = ''
  ) {}

  isValid(): boolean {
    return this.newPassword === this.confirmPassword && 
           this.newPassword.length >= 8 &&
           this.currentPassword.length > 0;
  }

  toJson(): any {
    return {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };
  }

  static fromJson(json: any): ChangePasswordRequest {
    return new ChangePasswordRequest(
      json.currentPassword,
      json.newPassword,
      json.confirmPassword
    );
  }
}

export class DeleteAccountRequest {
  constructor(
    public password: string = '',
    public reason?: string,
    public feedback?: string
  ) {}

  toJson(): any {
    return {
      password: this.password,
      reason: this.reason,
      feedback: this.feedback
    };
  }

  static fromJson(json: any): DeleteAccountRequest {
    return new DeleteAccountRequest(
      json.password,
      json.reason,
      json.feedback
    );
  }
}
