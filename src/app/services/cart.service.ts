import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
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
      totalItems: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
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
    const total = subtotal + tax + shipping;

    return {
      ...cart,
      totalItems,
      subtotal,
      tax,
      shipping,
      total
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

  // Apply discount code
  applyDiscount(code: string): { success: boolean; discount: number; message: string } {
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

  // Save cart for later
  saveForLater(): void {
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
        this.updateCart(cartData);
        localStorage.removeItem('saved_cart');
        return true;
      }
    } catch (error) {
      console.error('Error loading saved cart:', error);
    }
    return false;
  }
}

