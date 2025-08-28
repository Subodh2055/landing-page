import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { UserProfile, PersonalDetails, Address, UserPreferences, ProfileUpdateRequest, ChangePasswordRequest, DeleteAccountRequest } from '../models/user-profile.model';
import { LocalStorageUtil } from '../utils/local-storage.util';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();
  private readonly PROFILE_STORAGE_KEY = 'user_profile';

  constructor(
    private localStorageUtil: LocalStorageUtil,
    private toastr: ToastrService
  ) {
    this.loadProfile();
  }

  private loadProfile(): void {
    const profileData = this.localStorageUtil.getItem(this.PROFILE_STORAGE_KEY);
    if (profileData) {
      try {
        const profile = JSON.parse(profileData);
        // Convert date strings back to Date objects
        if (profile.createdAt) profile.createdAt = new Date(profile.createdAt);
        if (profile.updatedAt) profile.updatedAt = new Date(profile.updatedAt);
        if (profile.personalDetails?.dateOfBirth) {
          profile.personalDetails.dateOfBirth = new Date(profile.personalDetails.dateOfBirth);
        }
        this.profileSubject.next(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
        this.profileSubject.next(null);
      }
    }
  }

  private saveProfile(profile: UserProfile): void {
    this.localStorageUtil.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }

  getProfile(): Observable<UserProfile | null> {
    return this.profile$;
  }

  getCurrentProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  createProfile(userId: string, personalDetails: PersonalDetails): Observable<UserProfile> {
    const profile: UserProfile = {
      id: this.generateId(),
      userId,
      personalDetails,
      addresses: [],
      preferences: this.getDefaultPreferences(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.profileSubject.next(profile);
    this.saveProfile(profile);
    this.toastr.success('Profile created successfully', 'Profile Created');
    return of(profile);
  }

  updateProfile(updates: ProfileUpdateRequest): Observable<UserProfile | null> {
    const currentProfile = this.profileSubject.value;
    if (!currentProfile) {
      this.toastr.error('No profile found', 'Update Failed');
      return of(null);
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      personalDetails: updates.personalDetails ? { ...currentProfile.personalDetails, ...updates.personalDetails } : currentProfile.personalDetails,
      addresses: updates.addresses || currentProfile.addresses,
      preferences: updates.preferences ? { ...currentProfile.preferences, ...updates.preferences } : currentProfile.preferences,
      updatedAt: new Date()
    };

    this.profileSubject.next(updatedProfile);
    this.saveProfile(updatedProfile);
    this.toastr.success('Profile updated successfully', 'Profile Updated');
    return of(updatedProfile);
  }

  updatePersonalDetails(details: Partial<PersonalDetails>): Observable<UserProfile | null> {
    const currentProfile = this.profileSubject.value;
    if (!currentProfile) {
      this.toastr.error('No profile found', 'Update Failed');
      return of(null);
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      personalDetails: { ...currentProfile.personalDetails, ...details },
      updatedAt: new Date()
    };

    this.profileSubject.next(updatedProfile);
    this.saveProfile(updatedProfile);
    this.toastr.success('Personal details updated successfully', 'Profile Updated');
    return of(updatedProfile);
  }

  addAddress(address: Omit<Address, 'id'>): Observable<UserProfile | null> {
    const currentProfile = this.profileSubject.value;
    if (!currentProfile) {
      this.toastr.error('No profile found', 'Add Address Failed');
      return of(null);
    }

    const newAddress: Address = {
      ...address,
      id: this.generateId()
    };

    // If this is the first address or marked as default, update other addresses
    let updatedAddresses = [...currentProfile.addresses];
    if (newAddress.isDefault || updatedAddresses.length === 0) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
      newAddress.isDefault = true;
    }

    updatedAddresses.push(newAddress);

    const updatedProfile: UserProfile = {
      ...currentProfile,
      addresses: updatedAddresses,
      updatedAt: new Date()
    };

    this.profileSubject.next(updatedProfile);
    this.saveProfile(updatedProfile);
    this.toastr.success('Address added successfully', 'Address Added');
    return of(updatedProfile);
  }

  updateAddress(addressId: string, updates: Partial<Address>): Observable<UserProfile | null> {
    const currentProfile = this.profileSubject.value;
    if (!currentProfile) {
      this.toastr.error('No profile found', 'Update Address Failed');
      return of(null);
    }

    const addressIndex = currentProfile.addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      this.toastr.error('Address not found', 'Update Failed');
      return of(null);
    }

    let updatedAddresses = [...currentProfile.addresses];
    const updatedAddress = { ...updatedAddresses[addressIndex], ...updates };

    // If this address is now default, update other addresses
    if (updatedAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => 
        addr.id === addressId ? updatedAddress : { ...addr, isDefault: false }
      );
    } else {
      updatedAddresses[addressIndex] = updatedAddress;
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      addresses: updatedAddresses,
      updatedAt: new Date()
    };

    this.profileSubject.next(updatedProfile);
    this.saveProfile(updatedProfile);
    this.toastr.success('Address updated successfully', 'Address Updated');
    return of(updatedProfile);
  }

  deleteAddress(addressId: string): Observable<UserProfile | null> {
    const currentProfile = this.profileSubject.value;
    if (!currentProfile) {
      this.toastr.error('No profile found', 'Delete Address Failed');
      return of(null);
    }

    const addressToDelete = currentProfile.addresses.find(addr => addr.id === addressId);
    if (!addressToDelete) {
      this.toastr.error('Address not found', 'Delete Failed');
      return of(null);
    }

    let updatedAddresses = currentProfile.addresses.filter(addr => addr.id !== addressId);

    // If we deleted the default address and there are other addresses, make the first one default
    if (addressToDelete.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      addresses: updatedAddresses,
      updatedAt: new Date()
    };

    this.profileSubject.next(updatedProfile);
    this.saveProfile(updatedProfile);
    this.toastr.success('Address deleted successfully', 'Address Deleted');
    return of(updatedProfile);
  }

  setDefaultAddress(addressId: string): Observable<UserProfile | null> {
    const currentProfile = this.profileSubject.value;
    if (!currentProfile) {
      this.toastr.error('No profile found', 'Set Default Failed');
      return of(null);
    }

    const updatedAddresses = currentProfile.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));

    const updatedProfile: UserProfile = {
      ...currentProfile,
      addresses: updatedAddresses,
      updatedAt: new Date()
    };

    this.profileSubject.next(updatedProfile);
    this.saveProfile(updatedProfile);
    this.toastr.success('Default address updated', 'Address Updated');
    return of(updatedProfile);
  }

  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserProfile | null> {
    const currentProfile = this.profileSubject.value;
    if (!currentProfile) {
      this.toastr.error('No profile found', 'Update Preferences Failed');
      return of(null);
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      preferences: { ...currentProfile.preferences, ...preferences },
      updatedAt: new Date()
    };

    this.profileSubject.next(updatedProfile);
    this.saveProfile(updatedProfile);
    this.toastr.success('Preferences updated successfully', 'Preferences Updated');
    return of(updatedProfile);
  }

  changePassword(request: ChangePasswordRequest): Observable<boolean> {
    // In a real app, this would make an API call
    // For now, we'll simulate the process
    if (request.newPassword !== request.confirmPassword) {
      this.toastr.error('New passwords do not match', 'Password Change Failed');
      return of(false);
    }

    if (request.newPassword.length < 8) {
      this.toastr.error('Password must be at least 8 characters long', 'Password Change Failed');
      return of(false);
    }

    // Simulate API call delay
    return of(true).pipe(
      tap(() => {
        this.toastr.success('Password changed successfully', 'Password Changed');
      })
    );
  }

  deleteAccount(request: DeleteAccountRequest): Observable<boolean> {
    // In a real app, this would make an API call
    // For now, we'll simulate the process
    if (!request.password) {
      this.toastr.error('Password is required', 'Account Deletion Failed');
      return of(false);
    }

    // Simulate API call delay
    return of(true).pipe(
      tap(() => {
        this.profileSubject.next(null);
        this.localStorageUtil.removeItem(this.PROFILE_STORAGE_KEY);
        this.toastr.success('Account deleted successfully', 'Account Deleted');
      })
    );
  }

  uploadProfilePicture(file: File): Observable<string | null> {
    // In a real app, this would upload to a server
    // For now, we'll create a data URL
    return new Observable<string | null>(observer => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        observer.next(result);
        observer.complete();
      };
      reader.onerror = () => {
        observer.next(null);
        observer.complete();
      };
      reader.readAsDataURL(file);
    }).pipe(
      tap((dataUrl) => {
        if (dataUrl) {
          this.updatePersonalDetails({ profilePicture: dataUrl }).subscribe();
        }
      })
    );
  }

  getDefaultAddress(): Address | null {
    const profile = this.profileSubject.value;
    if (!profile || profile.addresses.length === 0) {
      return null;
    }
    return profile.addresses.find(addr => addr.isDefault) || profile.addresses[0];
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      theme: 'auto'
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  clearProfile(): void {
    this.profileSubject.next(null);
    this.localStorageUtil.removeItem(this.PROFILE_STORAGE_KEY);
  }
}
