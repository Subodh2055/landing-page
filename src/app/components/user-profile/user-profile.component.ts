import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserProfile, PersonalDetails, Address, UserPreferences, ChangePasswordRequest, DeleteAccountRequest } from '../../models/user-profile.model';
import { UserProfileService } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { OrderTrackingService } from '../../services/order-tracking.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Profile data
  profile: UserProfile | null = null;
  loading = false;
  currentUser: any = null;
  
  // Active tab
  activeTab: 'personal' | 'addresses' | 'wishlist' | 'orders' | 'preferences' | 'security' = 'personal';
  
  // Forms
  personalDetailsForm!: FormGroup;
  addressForm!: FormGroup;
  preferencesForm!: FormGroup;
  changePasswordForm!: FormGroup;
  deleteAccountForm!: FormGroup;
  
  // Address management
  editingAddress: Address | null = null;
  showAddressForm = false;
  
  // Wishlist and Orders
  wishlistCount = 0;
  ordersCount = 0;
  
  // File upload
  selectedFile: File | null = null;
  profilePicturePreview: string | null = null;
  
  // Countries for address form
  countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IN', name: 'India' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' }
  ];

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private orderTrackingService: OrderTrackingService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadProfile();
    this.subscribeToServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.personalDetailsForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      dateOfBirth: [''],
      gender: [''],
      bio: ['']
    });

    this.addressForm = this.formBuilder.group({
      type: ['home', Validators.required],
      isDefault: [false],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      company: [''],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.minLength(3)]],
      country: ['US', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      instructions: ['']
    });

    this.preferencesForm = this.formBuilder.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      marketingEmails: [false],
      language: ['en'],
      currency: ['USD'],
      timezone: ['UTC'],
      theme: ['auto']
    });

    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.deleteAccountForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      reason: [''],
      feedback: ['']
    });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadProfile(): void {
    this.loading = true;
    this.userProfileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.loading = false;
          if (profile) {
            this.populateForms(profile);
          } else {
            this.createInitialProfile();
          }
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.loading = false;
          this.toastr.error('Failed to load profile', 'Error');
        }
      });
  }

  private createInitialProfile(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      const initialDetails: PersonalDetails = {
        firstName: this.currentUser.firstName || '',
        lastName: this.currentUser.lastName || '',
        email: this.currentUser.email || '',
        phone: this.currentUser.phone || ''
      };
      
      this.userProfileService.createProfile(this.currentUser.id, initialDetails)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile) => {
            this.profile = profile;
            this.populateForms(profile);
          },
          error: (error) => {
            console.error('Error creating profile:', error);
            this.toastr.error('Failed to create profile', 'Error');
          }
        });
    }
  }

  private populateForms(profile: UserProfile): void {
    // Populate personal details form
    this.personalDetailsForm.patchValue({
      firstName: profile.personalDetails.firstName,
      lastName: profile.personalDetails.lastName,
      email: profile.personalDetails.email,
      phone: profile.personalDetails.phone,
      dateOfBirth: profile.personalDetails.dateOfBirth ? new Date(profile.personalDetails.dateOfBirth).toISOString().split('T')[0] : '',
      gender: profile.personalDetails.gender || '',
      bio: profile.personalDetails.bio || ''
    });

    // Populate preferences form
    this.preferencesForm.patchValue({
      emailNotifications: profile.preferences.emailNotifications,
      smsNotifications: profile.preferences.smsNotifications,
      pushNotifications: profile.preferences.pushNotifications,
      marketingEmails: profile.preferences.marketingEmails,
      language: profile.preferences.language,
      currency: profile.preferences.currency,
      timezone: profile.preferences.timezone,
      theme: profile.preferences.theme
    });
  }

  private subscribeToServices(): void {
    // Subscribe to wishlist count
    this.wishlistService.wishlist$
      .pipe(takeUntil(this.destroy$))
      .subscribe(wishlist => {
        this.wishlistCount = wishlist.length;
      });

    // Subscribe to orders count
    this.orderTrackingService.orders$
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        this.ordersCount = orders.length;
      });
  }

  // Tab navigation
  setActiveTab(tab: 'personal' | 'addresses' | 'wishlist' | 'orders' | 'preferences' | 'security'): void {
    this.activeTab = tab;
  }

  // Personal details
  onPersonalDetailsSubmit(): void {
    if (this.personalDetailsForm.valid) {
      const formValue = this.personalDetailsForm.value;
      const personalDetails: Partial<PersonalDetails> = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth) : undefined,
        gender: formValue.gender || undefined,
        bio: formValue.bio || undefined
      };

      this.userProfileService.updatePersonalDetails(personalDetails)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile) => {
            if (profile) {
              this.profile = profile;
              this.toastr.success('Personal details updated successfully', 'Success');
            }
          },
          error: (error) => {
            console.error('Error updating personal details:', error);
            this.toastr.error('Failed to update personal details', 'Error');
          }
        });
    }
  }

  // Address management
  addNewAddress(): void {
    this.editingAddress = null;
    this.addressForm.reset({
      type: 'home',
      isDefault: false
    });
    this.showAddressForm = true;
  }

  editAddress(address: Address): void {
    this.editingAddress = address;
    this.addressForm.patchValue({
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      instructions: address.instructions || ''
    });
    this.showAddressForm = true;
  }

  onAddressSubmit(): void {
    if (this.addressForm.valid) {
      const formValue = this.addressForm.value;
      
      if (this.editingAddress) {
        // Update existing address
        this.userProfileService.updateAddress(this.editingAddress.id, formValue)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (profile) => {
              if (profile) {
                this.profile = profile;
                this.showAddressForm = false;
                this.editingAddress = null;
                this.toastr.success('Address updated successfully', 'Success');
              }
            },
            error: (error) => {
              console.error('Error updating address:', error);
              this.toastr.error('Failed to update address', 'Error');
            }
          });
      } else {
        // Add new address
        this.userProfileService.addAddress(formValue)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (profile) => {
              if (profile) {
                this.profile = profile;
                this.showAddressForm = false;
                this.toastr.success('Address added successfully', 'Success');
              }
            },
            error: (error) => {
              console.error('Error adding address:', error);
              this.toastr.error('Failed to add address', 'Error');
            }
          });
      }
    }
  }

  deleteAddress(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.userProfileService.deleteAddress(addressId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile) => {
            if (profile) {
              this.profile = profile;
              this.toastr.success('Address deleted successfully', 'Success');
            }
          },
          error: (error) => {
            console.error('Error deleting address:', error);
            this.toastr.error('Failed to delete address', 'Error');
          }
        });
    }
  }

  setDefaultAddress(addressId: string): void {
    this.userProfileService.setDefaultAddress(addressId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          if (profile) {
            this.profile = profile;
            this.toastr.success('Default address updated', 'Success');
          }
        },
        error: (error) => {
          console.error('Error setting default address:', error);
          this.toastr.error('Failed to set default address', 'Error');
        }
      });
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddress = null;
    this.addressForm.reset();
  }

  // Preferences
  onPreferencesSubmit(): void {
    if (this.preferencesForm.valid) {
      const preferences: Partial<UserPreferences> = this.preferencesForm.value;
      
      this.userProfileService.updatePreferences(preferences)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile) => {
            if (profile) {
              this.profile = profile;
              this.toastr.success('Preferences updated successfully', 'Success');
            }
          },
          error: (error) => {
            console.error('Error updating preferences:', error);
            this.toastr.error('Failed to update preferences', 'Error');
          }
        });
    }
  }

  // Security
  onChangePasswordSubmit(): void {
    if (this.changePasswordForm.valid) {
      const request: ChangePasswordRequest = this.changePasswordForm.value;
      
      this.userProfileService.changePassword(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.changePasswordForm.reset();
              this.toastr.success('Password changed successfully', 'Success');
            }
          },
          error: (error) => {
            console.error('Error changing password:', error);
            this.toastr.error('Failed to change password', 'Error');
          }
        });
    }
  }

  onDeleteAccountSubmit(): void {
    if (this.deleteAccountForm.valid) {
      const request: DeleteAccountRequest = this.deleteAccountForm.value;
      
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        this.userProfileService.deleteAccount(request)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (success) => {
              if (success) {
                this.authService.logout();
                this.router.navigate(['/']);
              }
            },
            error: (error) => {
              console.error('Error deleting account:', error);
              this.toastr.error('Failed to delete account', 'Error');
            }
          });
      }
    }
  }

  // File upload
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.toastr.error('File size must be less than 5MB', 'Error');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select an image file', 'Error');
        return;
      }

      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfilePicture(): void {
    if (this.selectedFile) {
      this.userProfileService.uploadProfilePicture(this.selectedFile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dataUrl) => {
            if (dataUrl && this.profile) {
              this.profile.personalDetails.profilePicture = dataUrl;
              this.toastr.success('Profile picture uploaded successfully', 'Success');
            }
          },
          error: (error) => {
            console.error('Error uploading profile picture:', error);
            this.toastr.error('Failed to upload profile picture', 'Error');
          }
        });
    }
  }

  // Navigation
  navigateToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }

  // Utility methods
  getAddressTypeIcon(type: string): string {
    switch (type) {
      case 'home': return 'fas fa-home';
      case 'work': return 'fas fa-briefcase';
      default: return 'fas fa-map-marker-alt';
    }
  }

  getAddressTypeLabel(type: string): string {
    switch (type) {
      case 'home': return 'Home';
      case 'work': return 'Work';
      default: return 'Other';
    }
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getProfilePictureUrl(): string {
    if (this.profile?.personalDetails.profilePicture) {
      return this.profile.personalDetails.profilePicture;
    }
    return 'assets/images/default-avatar.png';
  }

  getFullName(): string {
    if (this.profile) {
      return `${this.profile.personalDetails.firstName} ${this.profile.personalDetails.lastName}`;
    }
    return 'User';
  }

  getInitials(): string {
    if (this.profile) {
      const { firstName, lastName } = this.profile.personalDetails;
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  }
}
