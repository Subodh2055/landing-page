import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem, DeliveryEstimate } from '../../services/cart.service';
import { Address } from '../../models/address.model';
import { Coupon } from '../../models/coupon.model';
import { PaymentMethod } from '../../models/payment-method.model';
import { CouponService } from '../../services/coupon.service';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import { UserProfileService } from '../../services/user-profile.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  savedForLater: CartItem[] = [];
  selectedAddress: Address | null = null;
  addresses: Address[] = [];
  appliedCoupon: Coupon | null = null;
  availableCoupons: Coupon[] = [];
  couponCode = '';
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethod: PaymentMethod | null = null;
  deliveryEstimate = '';
  showAddressModal = false;
  showCouponModal = false;
  
  // Cart summary
  subtotal = 0;
  tax = 0;
  shipping = 0;
  discount = 0;
  total = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private couponService: CouponService,
    private paymentMethodsService: PaymentMethodsService,
    private userProfileService: UserProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.loadAddresses();
    this.loadCoupons();
    this.loadPaymentMethods();
    this.subscribeToServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCartItems(): void {
    this.cartService.getCartObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cartItems = cart.items;
        this.savedForLater = cart.savedForLater;
        this.updateCartSummary();
        this.calculateDeliveryEstimate();
      });
  }

  private loadSavedForLater(): void {
    this.savedForLater = this.cartService.getSavedForLater();
  }

  private subscribeToServices(): void {
    // Subscribe to coupon service
    this.couponService.getAppliedCoupon()
      .pipe(takeUntil(this.destroy$))
      .subscribe(coupon => {
        this.appliedCoupon = coupon;
        this.updateCartSummary();
      });

    // Subscribe to payment methods service
    this.paymentMethodsService.getAvailablePaymentMethods()
      .pipe(takeUntil(this.destroy$))
      .subscribe(methods => {
        this.paymentMethods = methods;
      });

    this.paymentMethodsService.getSelectedPaymentMethod()
      .pipe(takeUntil(this.destroy$))
      .subscribe(method => {
        this.selectedPaymentMethod = method;
      });
  }

  private loadAddresses(): void {
    // Load addresses from user profile service
    this.userProfileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        if (profile && profile.addresses.length > 0) {
          this.addresses = profile.addresses.map(addr => new Address(
            parseInt(addr.id),
            `${addr.firstName} ${addr.lastName}`,
            addr.phone,
            addr.addressLine1,
            addr.addressLine2,
            addr.city,
            addr.state,
            addr.postalCode,
            addr.country,
            addr.isDefault
          ));
          this.selectedAddress = this.addresses.find(addr => addr.isDefault) || this.addresses[0];
        } else {
          // Create mock addresses if no profile
          this.addresses = [
            new Address(1, 'John Doe', '9876543210', '123 Main Street', 'Apt 4B', 'Mumbai', 'Maharashtra', '400001'),
            new Address(2, 'Jane Smith', '9876543211', '456 Oak Avenue', '', 'Delhi', 'Delhi', '110001')
          ];
          this.selectedAddress = this.addresses[0];
        }
      });
  }

  private loadCoupons(): void {
    this.couponService.getAvailableCoupons()
      .pipe(takeUntil(this.destroy$))
      .subscribe(coupons => {
        this.availableCoupons = coupons.filter(c => c.isValid());
      });
  }

  private loadPaymentMethods(): void {
    // Payment methods are loaded in subscribeToServices
  }

  private calculateDeliveryEstimate(): void {
    const deliveryEstimate = this.cartService.getDeliveryEstimate();
    if (deliveryEstimate) {
      this.deliveryEstimate = deliveryEstimate.estimatedDate.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }

  private updateCartSummary(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    this.tax = this.subtotal * 0.18; // 18% GST
    this.shipping = this.subtotal > 1000 ? 0 : 100; // Free shipping above ₹1000
    this.discount = this.couponService.calculateDiscount(this.subtotal);
    this.total = this.subtotal + this.tax + this.shipping - this.discount;
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(item);
    } else {
      this.cartService.updateQuantity(item.product.id, newQuantity);
    }
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id);
  }

  saveForLater(item: CartItem): void {
    this.cartService.saveItemForLater(item.product.id);
  }

  moveToCart(item: CartItem): void {
    this.cartService.moveItemToCart(item.product.id);
  }

  removeFromSaved(item: CartItem): void {
    this.cartService.removeFromSavedForLater(item.product.id);
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    
    const categories = this.cartItems.map(item => item.product.category);
    const productIds = this.cartItems.map(item => item.product.id);
    
    this.couponService.applyCoupon(this.couponCode, this.subtotal, categories, productIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.isValid) {
          this.couponCode = '';
          this.showCouponModal = false;
        }
      });
  }

  removeCoupon(): void {
    this.couponService.removeCoupon();
  }

  selectAddress(address: Address): void {
    this.selectedAddress = address;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethodsService.selectPaymentMethod(method.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  proceedToCheckout(): void {
    if (!this.selectedAddress) {
      this.toastr.error('Please select a delivery address', 'Address Required');
      return;
    }
    
    if (!this.selectedPaymentMethod) {
      this.toastr.error('Please select a payment method', 'Payment Method Required');
      return;
    }
    
    // Navigate to checkout page
    this.router.navigate(['/checkout']);
  }

  addNewAddress(): void {
    this.router.navigate(['/profile'], { queryParams: { tab: 'addresses' } });
  }

  closeAddressModal(): void {
    this.showAddressModal = false;
  }

  closeCouponModal(): void {
    this.showCouponModal = false;
    this.couponCode = '';
  }

  getCouponDiscountText(): string {
    return this.couponService.getDiscountText();
  }

  isEligibleForFreeShipping(): boolean {
    return this.subtotal >= 1000;
  }

  getShippingText(): string {
    if (this.isEligibleForFreeShipping()) {
      return 'Free Shipping';
    } else {
      const remaining = 1000 - this.subtotal;
      return `Add ₹${remaining.toFixed(2)} more for free shipping`;
    }
  }

  trackByItem(index: number, item: CartItem): number {
    return item.product.id;
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}
