import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaymentMethod } from '../models/payment-method.model';
import { LocalStorageUtil } from '../utils/local-storage.util';
import { ToastrService } from 'ngx-toastr';

export interface PaymentValidationResult {
  isValid: boolean;
  message: string;
  processingFee?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  public paymentMethods$ = this.paymentMethodsSubject.asObservable();
  
  private selectedMethodSubject = new BehaviorSubject<PaymentMethod | null>(null);
  public selectedMethod$ = this.selectedMethodSubject.asObservable();
  
  private readonly PAYMENT_METHODS_STORAGE_KEY = 'payment_methods';
  private readonly SELECTED_METHOD_KEY = 'selected_payment_method';

  constructor(
    private localStorageUtil: LocalStorageUtil,
    private toastr: ToastrService
  ) {
    this.initializePaymentMethods();
    this.loadSelectedMethod();
  }

  private initializePaymentMethods(): void {
    const storedMethods = this.localStorageUtil.getItem(this.PAYMENT_METHODS_STORAGE_KEY);
    if (storedMethods) {
      try {
        const methods = JSON.parse(storedMethods).map((m: any) => PaymentMethod.fromJson(m));
        this.paymentMethodsSubject.next(methods);
      } catch (error) {
        console.error('Error loading payment methods:', error);
        this.createDefaultPaymentMethods();
      }
    } else {
      this.createDefaultPaymentMethods();
    }
  }

  private createDefaultPaymentMethods(): void {
    const defaultMethods: PaymentMethod[] = [
      // Traditional Payment Methods
      new PaymentMethod(
        'cod',
        'Cash on Delivery',
        'fas fa-money-bill-wave',
        'Pay when you receive your order',
        true,
        0,
        'On Delivery',
        undefined,
        undefined
      ),
      new PaymentMethod(
        'card',
        'Credit/Debit Card',
        'fas fa-credit-card',
        'Secure payment with Visa, MasterCard, or American Express',
        true,
        2.5,
        'Instant',
        ['Visa', 'MasterCard', 'American Express', 'Discover'],
        undefined
      ),
      new PaymentMethod(
        'upi',
        'UPI Payment',
        'fas fa-mobile-alt',
        'Instant payment using UPI apps like Google Pay, PhonePe',
        true,
        0,
        'Instant',
        undefined,
        ['Google Pay', 'PhonePe', 'Paytm', 'BHIM']
      ),
      new PaymentMethod(
        'netbanking',
        'Net Banking',
        'fas fa-university',
        'Pay using your bank\'s internet banking',
        true,
        1.5,
        '2-3 hours',
        undefined,
        undefined
      ),

      // Nepali Payment Methods
      new PaymentMethod(
        'khalti',
        'Khalti Digital Wallet',
        'fas fa-wallet',
        'Pay using Khalti digital wallet - Nepal\'s leading payment gateway',
        true,
        0,
        'Instant',
        undefined,
        ['Khalti Wallet']
      ),
      new PaymentMethod(
        'esewa',
        'eSewa',
        'fas fa-mobile-alt',
        'Pay using eSewa - Nepal\'s trusted digital payment platform',
        true,
        0,
        'Instant',
        undefined,
        ['eSewa Wallet', 'eSewa Banking']
      ),
      new PaymentMethod(
        'nepalpay',
        'NepalPay',
        'fas fa-qrcode',
        'Pay using NepalPay QR code - National Payment Switch of Nepal',
        true,
        0,
        'Instant',
        undefined,
        ['NepalPay QR', 'NepalPay App']
      ),
      new PaymentMethod(
        'connectips',
        'ConnectIPS',
        'fas fa-exchange-alt',
        'Pay using ConnectIPS - Interbank Payment System',
        true,
        1.0,
        'Real-time',
        undefined,
        undefined
      ),
      new PaymentMethod(
        'imepay',
        'IME Pay',
        'fas fa-mobile-alt',
        'Pay using IME Pay - Mobile payment solution',
        true,
        0,
        'Instant',
        undefined,
        ['IME Pay App']
      ),
      new PaymentMethod(
        'cellpay',
        'CellPay',
        'fas fa-mobile-alt',
        'Pay using CellPay - Digital payment platform',
        true,
        0,
        'Instant',
        undefined,
        ['CellPay App']
      ),
      new PaymentMethod(
        'bank_transfer',
        'Bank Transfer',
        'fas fa-university',
        'Direct bank transfer to our account',
        true,
        0,
        '1-2 business days',
        undefined,
        undefined
      )
    ];

    this.paymentMethodsSubject.next(defaultMethods);
    this.savePaymentMethods(defaultMethods);
  }

  private savePaymentMethods(methods: PaymentMethod[]): void {
    this.localStorageUtil.setItem(this.PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(methods));
  }

  private loadSelectedMethod(): void {
    const storedMethod = this.localStorageUtil.getItem(this.SELECTED_METHOD_KEY);
    if (storedMethod) {
      try {
        const method = PaymentMethod.fromJson(JSON.parse(storedMethod));
        this.selectedMethodSubject.next(method);
      } catch (error) {
        console.error('Error loading selected payment method:', error);
        this.clearSelectedMethod();
      }
    }
  }

  private saveSelectedMethod(method: PaymentMethod | null): void {
    if (method) {
      this.localStorageUtil.setItem(this.SELECTED_METHOD_KEY, JSON.stringify(method.toJson()));
    } else {
      this.localStorageUtil.removeItem(this.SELECTED_METHOD_KEY);
    }
  }

  getAvailablePaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethods$;
  }

  getSelectedPaymentMethod(): Observable<PaymentMethod | null> {
    return this.selectedMethod$;
  }

  getCurrentSelectedMethod(): PaymentMethod | null {
    return this.selectedMethodSubject.value;
  }

  selectPaymentMethod(methodId: string): Observable<PaymentMethod | null> {
    const method = this.paymentMethodsSubject.value.find(m => m.id === methodId);
    if (method) {
      this.selectedMethodSubject.next(method);
      this.saveSelectedMethod(method);
      this.toastr.success(`Payment method changed to ${method.name}`, 'Payment Method Selected');
      return of(method);
    } else {
      this.toastr.error('Invalid payment method', 'Selection Failed');
      return of(null);
    }
  }

  clearSelectedMethod(): void {
    this.selectedMethodSubject.next(null);
    this.saveSelectedMethod(null);
  }

  validatePaymentMethod(methodId: string, amount: number): PaymentValidationResult {
    const method = this.paymentMethodsSubject.value.find(m => m.id === methodId);
    
    if (!method) {
      return {
        isValid: false,
        message: 'Invalid payment method'
      };
    }

    if (!method.isAvailable) {
      return {
        isValid: false,
        message: 'Payment method is currently unavailable'
      };
    }

    // Check minimum amount for certain payment methods
    if (methodId === 'khalti' && amount < 10) {
      return {
        isValid: false,
        message: 'Minimum amount for Khalti is ₹10'
      };
    }

    if (methodId === 'esewa' && amount < 5) {
      return {
        isValid: false,
        message: 'Minimum amount for eSewa is ₹5'
      };
    }

    return {
      isValid: true,
      message: 'Payment method is valid',
      processingFee: method.processingFee
    };
  }

  getPaymentMethodsByType(type: 'digital' | 'traditional' | 'nepali'): Observable<PaymentMethod[]> {
    return this.paymentMethods$.pipe(
      map(methods => {
        switch (type) {
          case 'digital':
            return methods.filter(m => ['upi', 'card', 'netbanking'].includes(m.id));
          case 'traditional':
            return methods.filter(m => ['cod', 'bank_transfer'].includes(m.id));
          case 'nepali':
            return methods.filter(m => ['khalti', 'esewa', 'nepalpay', 'connectips', 'imepay', 'cellpay'].includes(m.id));
          default:
            return methods;
        }
      })
    );
  }

  getRecommendedPaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethods$.pipe(
      map(methods => methods.filter(m => m.isRecommended()))
    );
  }

  getInstantPaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethods$.pipe(
      map(methods => methods.filter(m => m.isInstantPayment()))
    );
  }

  getFreePaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethods$.pipe(
      map(methods => methods.filter(m => m.processingFee === 0))
    );
  }

  searchPaymentMethods(query: string): Observable<PaymentMethod[]> {
    const searchTerm = query.toLowerCase();
    return this.paymentMethods$.pipe(
      map(methods => methods.filter(m => 
        m.name.toLowerCase().includes(searchTerm) ||
        m.description.toLowerCase().includes(searchTerm)
      ))
    );
  }

  addPaymentMethod(method: PaymentMethod): Observable<PaymentMethod> {
    const currentMethods = this.paymentMethodsSubject.value;
    const newMethod = new PaymentMethod(
      method.id,
      method.name,
      method.icon,
      method.description,
      method.isAvailable,
      method.processingFee,
      method.processingTime,
      method.supportedCards,
      method.supportedWallets
    );
    const updatedMethods = [...currentMethods, newMethod];
    
    this.paymentMethodsSubject.next(updatedMethods);
    this.savePaymentMethods(updatedMethods);
    
    this.toastr.success('Payment method added successfully', 'Payment Method Added');
    return of(newMethod);
  }

  updatePaymentMethod(method: PaymentMethod): Observable<PaymentMethod> {
    const currentMethods = this.paymentMethodsSubject.value;
    const updatedMethods = currentMethods.map(m => m.id === method.id ? method : m);
    
    this.paymentMethodsSubject.next(updatedMethods);
    this.savePaymentMethods(updatedMethods);
    
    this.toastr.success('Payment method updated successfully', 'Payment Method Updated');
    return of(method);
  }

  deletePaymentMethod(methodId: string): Observable<boolean> {
    const currentMethods = this.paymentMethodsSubject.value;
    const updatedMethods = currentMethods.filter(m => m.id !== methodId);
    
    this.paymentMethodsSubject.next(updatedMethods);
    this.savePaymentMethods(updatedMethods);
    
    this.toastr.success('Payment method deleted successfully', 'Payment Method Deleted');
    return of(true);
  }

  togglePaymentMethodAvailability(methodId: string): Observable<boolean> {
    const currentMethods = this.paymentMethodsSubject.value;
    const updatedMethods = currentMethods.map(m => {
      if (m.id === methodId) {
        return new PaymentMethod(
          m.id,
          m.name,
          m.icon,
          m.description,
          !m.isAvailable,
          m.processingFee,
          m.processingTime,
          m.supportedCards,
          m.supportedWallets
        );
      }
      return m;
    });
    
    this.paymentMethodsSubject.next(updatedMethods);
    this.savePaymentMethods(updatedMethods);
    
    const method = updatedMethods.find(m => m.id === methodId);
    const status = method?.isAvailable ? 'enabled' : 'disabled';
    this.toastr.success(`Payment method ${status}`, 'Status Updated');
    
    return of(true);
  }

  getPaymentMethodStats(): Observable<{ total: number; available: number; unavailable: number; instant: number; free: number }> {
    return this.paymentMethods$.pipe(
      map(methods => {
        const total = methods.length;
        const available = methods.filter(m => m.isAvailable).length;
        const unavailable = total - available;
        const instant = methods.filter(m => m.isInstantPayment()).length;
        const free = methods.filter(m => m.processingFee === 0).length;
        
        return { total, available, unavailable, instant, free };
      })
    );
  }

  getProcessingFee(amount: number): number {
    const selectedMethod = this.selectedMethodSubject.value;
    if (!selectedMethod) return 0;
    
    if (selectedMethod.processingFee === 0) return 0;
    
    // Calculate processing fee as percentage of amount
    return (amount * selectedMethod.processingFee) / 100;
  }

  getTotalWithProcessingFee(amount: number): number {
    return amount + this.getProcessingFee(amount);
  }

  getPaymentAdvantages(methodId: string): string[] {
    const method = this.paymentMethodsSubject.value.find(m => m.id === methodId);
    return method ? method.getPaymentAdvantages() : [];
  }
}
