import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

export class CartItem {
  constructor(
    public product: Product,
    public quantity: number,
    public addedAt: Date = new Date(),
    public savedForLater: boolean = false
  ) {}

  getTotalPrice(): number {
    return this.product.price * this.quantity;
  }

  toJson(): any {
    return {
      product: this.product.toJson(),
      quantity: this.quantity,
      addedAt: this.addedAt.toISOString(),
      savedForLater: this.savedForLater
    };
  }

  static fromJson(json: any): CartItem {
    return new CartItem(
      Product.fromJson(json.product),
      json.quantity,
      new Date(json.addedAt),
      json.savedForLater || false
    );
  }
}

export class Cart {
  constructor(
    public items: CartItem[] = [],
    public savedForLater: CartItem[] = [],
    public totalItems: number = 0,
    public subtotal: number = 0,
    public tax: number = 0,
    public shipping: number = 0,
    public discount: number = 0,
    public total: number = 0,
    public deliveryEstimate?: DeliveryEstimate
  ) {}

  toJson(): any {
    return {
      items: this.items.map(item => item.toJson()),
      savedForLater: this.savedForLater.map(item => item.toJson()),
      totalItems: this.totalItems,
      subtotal: this.subtotal,
      tax: this.tax,
      shipping: this.shipping,
      discount: this.discount,
      total: this.total,
      deliveryEstimate: this.deliveryEstimate?.toJson()
    };
  }

  static fromJson(json: any): Cart {
    return new Cart(
      json.items?.map((item: any) => CartItem.fromJson(item)) || [],
      json.savedForLater?.map((item: any) => CartItem.fromJson(item)) || [],
      json.totalItems || 0,
      json.subtotal || 0,
      json.tax || 0,
      json.shipping || 0,
      json.discount || 0,
      json.total || 0,
      json.deliveryEstimate ? DeliveryEstimate.fromJson(json.deliveryEstimate) : undefined
    );
  }
}

export class DeliveryEstimate {
  constructor(
    public estimatedDate: Date,
    public deliveryTime: string,
    public isExpress: boolean = false,
    public cost: number = 0,
    public isFree: boolean = false
  ) {}

  getFormattedDate(): string {
    return this.estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedCost(): string {
    if (this.isFree) return 'Free';
    return `NPR ${this.cost.toFixed(2)}`;
  }

  toJson(): any {
    return {
      estimatedDate: this.estimatedDate.toISOString(),
      deliveryTime: this.deliveryTime,
      isExpress: this.isExpress,
      cost: this.cost,
      isFree: this.isFree
    };
  }

  static fromJson(json: any): DeliveryEstimate {
    return new DeliveryEstimate(
      new Date(json.estimatedDate),
      json.deliveryTime,
      json.isExpress || false,
      json.cost || 0,
      json.isFree || false
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();

  private readonly CART_STORAGE_KEY = 'shopping_cart';
  private readonly TAX_RATE = 0.08; // 8% tax rate
  private readonly SHIPPING_THRESHOLD = 50; // Free shipping over $50
  private readonly SHIPPING_COST = 5.99; // Standard shipping cost

  constructor() {
    this.loadCartFromStorage();
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      savedForLater: [],
      totalItems: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0
    };
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        const cartData = JSON.parse(storedCart);
        // Convert stored data back to proper objects
        cartData.items = cartData.items.map((item: any) => ({
          ...item,
          product: Product.fromJson(item.product),
          addedAt: new Date(item.addedAt)
        }));
        this.cartSubject.next(cartData);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.clearCart();
    }
  }

  private saveCartToStorage(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private calculateCart(cart: Cart): Cart {
    let totalItems = 0;
    let subtotal = 0;

    cart.items.forEach(item => {
      totalItems += item.quantity;
      subtotal += item.product.price * item.quantity;
    });

    const tax = subtotal * this.TAX_RATE;
    const shipping = subtotal >= this.SHIPPING_THRESHOLD ? 0 : this.SHIPPING_COST;
    const discount = cart.discount || 0;
    const total = subtotal + tax + shipping - discount;

    // Calculate delivery estimate
    const deliveryEstimate = this.calculateDeliveryEstimate(subtotal, shipping);

    return {
      ...cart,
      totalItems,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      deliveryEstimate
    };
  }

  private calculateDeliveryEstimate(subtotal: number, shipping: number): DeliveryEstimate {
    const today = new Date();
    const estimatedDate = new Date(today);
    
    // Standard delivery: 3-5 days
    let deliveryDays = 4;
    let deliveryTime = '3-5 business days';
    let isExpress = false;
    let cost = shipping;
    let isFree = shipping === 0;

    // Express delivery available for orders above ₹2000
    if (subtotal >= 2000) {
      estimatedDate.setDate(today.getDate() + 2);
      deliveryDays = 2;
      deliveryTime = '1-2 business days';
      isExpress = true;
      cost = 200; // Express delivery cost
      isFree = false;
    } else {
      estimatedDate.setDate(today.getDate() + deliveryDays);
    }

    // Skip weekends
    while (estimatedDate.getDay() === 0 || estimatedDate.getDay() === 6) {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
    }

    return {
      estimatedDate,
      deliveryTime,
      isExpress,
      cost,
      isFree
    };
  }

  private updateCart(cart: Cart): void {
    const calculatedCart = this.calculateCart(cart);
    this.cartSubject.next(calculatedCart);
    this.saveCartToStorage(calculatedCart);
  }

  // Add product to cart
  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.product.id === product.id);

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        product,
        quantity,
        addedAt: new Date()
      };
      currentCart.items.push(newItem);
    }

    this.updateCart(currentCart);
  }

  // Remove product from cart
  removeFromCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.product.id !== productId);
    this.updateCart(currentCart);
  }

  // Update product quantity
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(item => item.product.id === productId);
    
    if (itemIndex >= 0) {
      currentCart.items[itemIndex].quantity = quantity;
      this.updateCart(currentCart);
    }
  }

  // Get cart item by product ID
  getCartItem(productId: number): CartItem | undefined {
    return this.cartSubject.value.items.find(item => item.product.id === productId);
  }

  // Check if product is in cart
  isInCart(productId: number): boolean {
    return this.getCartItem(productId) !== undefined;
  }

  // Get current cart
  getCart(): Cart {
    return this.cartSubject.value;
  }

  // Get cart as observable
  getCartObservable(): Observable<Cart> {
    return this.cart$;
  }

  // Clear cart
  clearCart(): void {
    const emptyCart = this.getInitialCart();
    this.updateCart(emptyCart);
  }

  // Get cart item count
  getItemCount(): number {
    return this.cartSubject.value.totalItems;
  }

  // Get cart total
  getCartTotal(): number {
    return this.cartSubject.value.total;
  }

  // Checkout process
  checkout(): Observable<{ success: boolean; orderId?: string; error?: string }> {
    return new Observable(observer => {
      const cart = this.getCart();
      
      if (cart.items.length === 0) {
        observer.next({ success: false, error: 'Cart is empty' });
        observer.complete();
        return;
      }

      // Simulate checkout process
      setTimeout(() => {
        const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Clear cart after successful checkout
        this.clearCart();
        
        observer.next({ success: true, orderId });
        observer.complete();
      }, 2000); // Simulate 2 second processing time
    });
  }

  // Apply discount code (legacy method - use CouponService instead)
  applyDiscountCode(code: string): { success: boolean; discount: number; message: string } {
    const discountCodes: { [key: string]: number } = {
      'SAVE10': 0.10, // 10% off
      'SAVE20': 0.20, // 20% off
      'FREESHIP': 0,   // Free shipping
      'WELCOME': 0.15  // 15% off
    };

    const discountRate = discountCodes[code.toUpperCase()];
    
    if (discountRate !== undefined) {
      const currentCart = this.cartSubject.value;
      const discountAmount = currentCart.subtotal * discountRate;
      
      // Apply discount to total
      const discountedTotal = currentCart.total - discountAmount;
      
      // Update cart with discount
      const updatedCart = {
        ...currentCart,
        total: Math.max(0, discountedTotal)
      };
      
      this.cartSubject.next(updatedCart);
      this.saveCartToStorage(updatedCart);
      
      return {
        success: true,
        discount: discountAmount,
        message: `Discount applied: ${(discountRate * 100)}% off`
      };
    }

    return {
      success: false,
      discount: 0,
      message: 'Invalid discount code'
    };
  }

  // Get shipping estimate
  getShippingEstimate(): { cost: number; isFree: boolean; threshold: number } {
    const subtotal = this.cartSubject.value.subtotal;
    const isFree = subtotal >= this.SHIPPING_THRESHOLD;
    const cost = isFree ? 0 : this.SHIPPING_COST;
    
    return {
      cost,
      isFree,
      threshold: this.SHIPPING_THRESHOLD
    };
  }

  // Get tax estimate
  getTaxEstimate(): number {
    return this.cartSubject.value.subtotal * this.TAX_RATE;
  }

  // Move item to wishlist (remove from cart)
  moveToWishlist(productId: number): void {
    this.removeFromCart(productId);
    // Note: Wishlist functionality would be implemented separately
  }

  // Save item for later
  saveItemForLater(productId: number): void {
    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(item => item.product.id === productId);
    
    if (itemIndex >= 0) {
      const item = currentCart.items[itemIndex];
      item.savedForLater = true;
      
      // Move item from cart to saved for later
      currentCart.savedForLater.push(item);
      currentCart.items.splice(itemIndex, 1);
      
      this.updateCart(currentCart);
    }
  }

  // Move item back to cart
  moveItemToCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.savedForLater.findIndex(item => item.product.id === productId);
    
    if (itemIndex >= 0) {
      const item = currentCart.savedForLater[itemIndex];
      item.savedForLater = false;
      
      // Move item from saved for later to cart
      currentCart.items.push(item);
      currentCart.savedForLater.splice(itemIndex, 1);
      
      this.updateCart(currentCart);
    }
  }

  // Remove item from saved for later
  removeFromSavedForLater(productId: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.savedForLater = currentCart.savedForLater.filter(item => item.product.id !== productId);
    this.updateCart(currentCart);
  }

  // Get saved for later items
  getSavedForLater(): CartItem[] {
    return this.cartSubject.value.savedForLater;
  }

  // Get saved for later count
  getSavedForLaterCount(): number {
    return this.cartSubject.value.savedForLater.length;
  }

  // Check if item is saved for later
  isSavedForLater(productId: number): boolean {
    return this.cartSubject.value.savedForLater.some(item => item.product.id === productId);
  }

  // Save entire cart for later
  saveCartForLater(): void {
    const cart = this.getCart();
    try {
      localStorage.setItem('saved_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart for later:', error);
    }
  }

  // Load saved cart
  loadSavedCart(): boolean {
    try {
      const savedCart = localStorage.getItem('saved_cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        cartData.items = cartData.items.map((item: any) => ({
          ...item,
          product: Product.fromJson(item.product),
          addedAt: new Date(item.addedAt)
        }));
        cartData.savedForLater = cartData.savedForLater.map((item: any) => ({
          ...item,
          product: Product.fromJson(item.product),
          addedAt: new Date(item.addedAt)
        }));
        this.updateCart(cartData);
        localStorage.removeItem('saved_cart');
        return true;
      }
    } catch (error) {
      console.error('Error loading saved cart:', error);
    }
    return false;
  }

  // Get delivery estimate
  getDeliveryEstimate(): DeliveryEstimate | undefined {
    return this.cartSubject.value.deliveryEstimate;
  }

  // Update delivery estimate
  updateDeliveryEstimate(isExpress: boolean = false): void {
    const currentCart = this.cartSubject.value;
    const deliveryEstimate = this.calculateDeliveryEstimate(currentCart.subtotal, currentCart.shipping);
    
    if (isExpress && currentCart.subtotal >= 2000) {
      deliveryEstimate.isExpress = true;
      deliveryEstimate.deliveryTime = '1-2 business days';
      deliveryEstimate.cost = 200;
      deliveryEstimate.isFree = false;
      deliveryEstimate.estimatedDate.setDate(deliveryEstimate.estimatedDate.getDate() - 2);
    }
    
    currentCart.deliveryEstimate = deliveryEstimate;
    this.updateCart(currentCart);
  }

  // Apply discount
  applyDiscount(discountAmount: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.discount = discountAmount;
    this.updateCart(currentCart);
  }

  // Remove discount
  removeDiscount(): void {
    const currentCart = this.cartSubject.value;
    currentCart.discount = 0;
    this.updateCart(currentCart);
  }

  // Get discount amount
  getDiscountAmount(): number {
    return this.cartSubject.value.discount;
  }
}

