export interface UserProfile {
  id: string;
  userId: string;
  personalDetails: PersonalDetails;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  profilePicture?: string;
  bio?: string;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  instructions?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface ProfileUpdateRequest {
  personalDetails?: Partial<PersonalDetails>;
  addresses?: Address[];
  preferences?: Partial<UserPreferences>;
}

export interface AddressFormData {
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  instructions?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  feedback?: string;
}
