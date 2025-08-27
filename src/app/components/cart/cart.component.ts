import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { Address } from '../../models/address.model';
import { Coupon } from '../../models/coupon.model';
import { PaymentMethod } from '../../models/payment-method.model';
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

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.loadSavedForLater();
    this.loadAddresses();
    this.loadCoupons();
    this.loadPaymentMethods();
    this.calculateDeliveryEstimate();
    this.updateCartSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCartItems(): void {
    // For now, we'll create some mock cart items
    this.cartItems = [];
    this.updateCartSummary();
  }

  private loadSavedForLater(): void {
    // For now, we'll create some mock saved items
    this.savedForLater = [];
  }

  private loadAddresses(): void {
    // Create mock addresses
    this.addresses = [
      new Address(1, 'John Doe', '9876543210', '123 Main Street', 'Apt 4B', 'Mumbai', 'Maharashtra', '400001'),
      new Address(2, 'Jane Smith', '9876543211', '456 Oak Avenue', '', 'Delhi', 'Delhi', '110001')
    ];
    if (this.addresses.length > 0) {
      this.selectedAddress = this.addresses[0];
    }
  }

  private loadCoupons(): void {
    // Create mock coupons
    this.availableCoupons = [
      new Coupon(1, 'WELCOME10', 'Welcome Discount', 'Get 10% off on your first order', 'percentage', 10, 500),
      new Coupon(2, 'SAVE50', 'Flat Discount', 'Save ₹50 on orders above ₹1000', 'fixed', 50, 1000)
    ];
  }

  private loadPaymentMethods(): void {
    this.paymentMethods = [
      new PaymentMethod('cod', 'Cash on Delivery', 'fas fa-money-bill-wave', 'Pay when you receive'),
      new PaymentMethod('card', 'Credit/Debit Card', 'fas fa-credit-card', 'Secure payment'),
      new PaymentMethod('upi', 'UPI', 'fas fa-mobile-alt', 'Instant payment'),
      new PaymentMethod('wallet', 'Digital Wallet', 'fas fa-wallet', 'Paytm, PhonePe, etc.')
    ];
  }

  private calculateDeliveryEstimate(): void {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3); // 3 days delivery
    this.deliveryEstimate = deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  private updateCartSummary(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.getTotalPrice(), 0);
    this.tax = this.subtotal * 0.18; // 18% GST
    this.shipping = this.subtotal > 1000 ? 0 : 100; // Free shipping above ₹1000
    this.discount = this.appliedCoupon ? this.calculateDiscount() : 0;
    this.total = this.subtotal + this.tax + this.shipping - this.discount;
  }

  private calculateDiscount(): number {
    if (!this.appliedCoupon) return 0;
    
    if (this.appliedCoupon.type === 'percentage') {
      return (this.subtotal * this.appliedCoupon.value) / 100;
    } else {
      return this.appliedCoupon.value;
    }
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(item);
    } else {
      item.quantity = newQuantity;
      this.updateCartSummary();
    }
  }

  removeFromCart(item: CartItem): void {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.updateCartSummary();
  }

  saveForLater(item: CartItem): void {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.savedForLater.push(item);
    this.updateCartSummary();
  }

  moveToCart(item: CartItem): void {
    this.savedForLater = this.savedForLater.filter(i => i.id !== item.id);
    this.cartItems.push(item);
    this.updateCartSummary();
  }

  removeFromSaved(item: CartItem): void {
    this.savedForLater = this.savedForLater.filter(i => i.id !== item.id);
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    
    const coupon = this.availableCoupons.find(c => c.code.toLowerCase() === this.couponCode.toLowerCase());
    if (coupon) {
      this.appliedCoupon = coupon;
      this.updateCartSummary();
      this.couponCode = '';
      this.showCouponModal = false;
    } else {
      alert('Invalid coupon code');
    }
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.updateCartSummary();
  }

  selectAddress(address: Address): void {
    this.selectedAddress = address;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  proceedToCheckout(): void {
    if (!this.selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    
    if (!this.selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    // Navigate to checkout
    console.log('Proceeding to checkout with:', {
      items: this.cartItems,
      address: this.selectedAddress,
      paymentMethod: this.selectedPaymentMethod,
      total: this.total
    });
  }

  addNewAddress(): void {
    this.showAddressModal = true;
  }

  closeAddressModal(): void {
    this.showAddressModal = false;
  }

  closeCouponModal(): void {
    this.showCouponModal = false;
  }

  getCouponDiscountText(): string {
    if (!this.appliedCoupon) return '';
    
    if (this.appliedCoupon.type === 'percentage') {
      return `${this.appliedCoupon.value}% OFF`;
    } else {
      return `₹${this.appliedCoupon.value} OFF`;
    }
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
    return item.id;
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}
