import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Coupon } from '../models/coupon.model';
import { LocalStorageUtil } from '../utils/local-storage.util';
import { ToastrService } from 'ngx-toastr';

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  message: string;
  discountAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private couponsSubject = new BehaviorSubject<Coupon[]>([]);
  public coupons$ = this.couponsSubject.asObservable();
  
  private appliedCouponSubject = new BehaviorSubject<Coupon | null>(null);
  public appliedCoupon$ = this.appliedCouponSubject.asObservable();
  
  private readonly COUPONS_STORAGE_KEY = 'available_coupons';
  private readonly APPLIED_COUPON_KEY = 'applied_coupon';

  constructor(
    private localStorageUtil: LocalStorageUtil,
    private toastr: ToastrService
  ) {
    this.initializeCoupons();
    this.loadAppliedCoupon();
  }

  private initializeCoupons(): void {
    const storedCoupons = this.localStorageUtil.getItem(this.COUPONS_STORAGE_KEY);
    if (storedCoupons) {
      try {
        const coupons = JSON.parse(storedCoupons).map((c: any) => Coupon.fromJson(c));
        this.couponsSubject.next(coupons);
      } catch (error) {
        console.error('Error loading coupons:', error);
        this.createDefaultCoupons();
      }
    } else {
      this.createDefaultCoupons();
    }
  }

  private createDefaultCoupons(): void {
    const defaultCoupons: Coupon[] = [
      new Coupon(1, 'WELCOME10', 'Welcome Discount', 'Get 10% off on your first order', 'percentage', 10, 500, 200),
      new Coupon(2, 'SAVE50', 'Flat Discount', 'Save ₹50 on orders above ₹1000', 'fixed', 50, 1000),
      new Coupon(3, 'FREESHIP', 'Free Shipping', 'Free shipping on orders above ₹500', 'fixed', 100, 500),
      new Coupon(4, 'FLASH20', 'Flash Sale', '20% off on electronics', 'percentage', 20, 1000, 500, new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      new Coupon(5, 'NEWUSER', 'New User Special', '15% off for new users', 'percentage', 15, 300, 300),
      new Coupon(6, 'BULK25', 'Bulk Purchase', '25% off on orders above ₹2000', 'percentage', 25, 2000, 1000),
      new Coupon(7, 'WEEKEND', 'Weekend Special', '₹100 off on weekends', 'fixed', 100, 800),
      new Coupon(8, 'LOYALTY', 'Loyalty Reward', '5% off for loyal customers', 'percentage', 5, 1000, 200)
    ];

    this.couponsSubject.next(defaultCoupons);
    this.saveCoupons(defaultCoupons);
  }

  private saveCoupons(coupons: Coupon[]): void {
    this.localStorageUtil.setItem(this.COUPONS_STORAGE_KEY, JSON.stringify(coupons));
  }

  private loadAppliedCoupon(): void {
    const storedCoupon = this.localStorageUtil.getItem(this.APPLIED_COUPON_KEY);
    if (storedCoupon) {
      try {
        const coupon = Coupon.fromJson(JSON.parse(storedCoupon));
        this.appliedCouponSubject.next(coupon);
      } catch (error) {
        console.error('Error loading applied coupon:', error);
        this.clearAppliedCoupon();
      }
    }
  }

  private saveAppliedCoupon(coupon: Coupon | null): void {
    if (coupon) {
      this.localStorageUtil.setItem(this.APPLIED_COUPON_KEY, JSON.stringify(coupon.toJson()));
    } else {
      this.localStorageUtil.removeItem(this.APPLIED_COUPON_KEY);
    }
  }

  getAvailableCoupons(): Observable<Coupon[]> {
    return this.coupons$;
  }

  getAppliedCoupon(): Observable<Coupon | null> {
    return this.appliedCoupon$;
  }

  getCurrentAppliedCoupon(): Coupon | null {
    return this.appliedCouponSubject.value;
  }

  validateCoupon(code: string, orderAmount: number, categories: string[] = [], productIds: number[] = []): CouponValidationResult {
    const coupon = this.couponsSubject.value.find(c => 
      c.code.toLowerCase() === code.toLowerCase() && c.isActive
    );

    if (!coupon) {
      return {
        isValid: false,
        message: 'Invalid coupon code'
      };
    }

    if (!coupon.isValid()) {
      return {
        isValid: false,
        message: 'Coupon has expired or is no longer valid'
      };
    }

    if (!coupon.canApplyToOrder(orderAmount)) {
      return {
        isValid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      };
    }

    if (!coupon.isApplicableToCategory(categories[0] || '')) {
      return {
        isValid: false,
        message: 'Coupon not applicable to selected category'
      };
    }

    if (productIds.length > 0 && !coupon.isApplicableToProduct(productIds[0])) {
      return {
        isValid: false,
        message: 'Coupon not applicable to selected products'
      };
    }

    const discountAmount = coupon.calculateDiscount(orderAmount);

    return {
      isValid: true,
      coupon,
      message: `Coupon applied successfully! ${coupon.getDiscountText()}`,
      discountAmount
    };
  }

  applyCoupon(code: string, orderAmount: number, categories: string[] = [], productIds: number[] = []): Observable<CouponValidationResult> {
    const validation = this.validateCoupon(code, orderAmount, categories, productIds);
    
    if (validation.isValid && validation.coupon) {
      this.appliedCouponSubject.next(validation.coupon);
      this.saveAppliedCoupon(validation.coupon);
      this.toastr.success(validation.message, 'Coupon Applied');
    } else {
      this.toastr.error(validation.message, 'Invalid Coupon');
    }

    return of(validation);
  }

  removeCoupon(): void {
    this.appliedCouponSubject.next(null);
    this.saveAppliedCoupon(null);
    this.toastr.info('Coupon removed', 'Coupon Removed');
  }

  clearAppliedCoupon(): void {
    this.appliedCouponSubject.next(null);
    this.saveAppliedCoupon(null);
  }

  calculateDiscount(orderAmount: number): number {
    const appliedCoupon = this.appliedCouponSubject.value;
    if (!appliedCoupon) return 0;
    
    return appliedCoupon.calculateDiscount(orderAmount);
  }

  getDiscountText(): string {
    const appliedCoupon = this.appliedCouponSubject.value;
    if (!appliedCoupon) return '';
    
    return appliedCoupon.getDiscountText();
  }

  addCoupon(coupon: Coupon): Observable<Coupon> {
    const currentCoupons = this.couponsSubject.value;
    const newCoupon = new Coupon(
      Date.now(),
      coupon.code,
      coupon.name,
      coupon.description,
      coupon.type,
      coupon.value,
      coupon.minOrderAmount,
      coupon.maxDiscount,
      coupon.validFrom,
      coupon.validUntil,
      coupon.usageLimit,
      coupon.usedCount,
      coupon.isActive,
      coupon.applicableCategories,
      coupon.applicableProducts
    );
    const updatedCoupons = [...currentCoupons, newCoupon];
    
    this.couponsSubject.next(updatedCoupons);
    this.saveCoupons(updatedCoupons);
    
    this.toastr.success('Coupon added successfully', 'Coupon Added');
    return of(newCoupon);
  }

  updateCoupon(coupon: Coupon): Observable<Coupon> {
    const currentCoupons = this.couponsSubject.value;
    const updatedCoupons = currentCoupons.map(c => c.id === coupon.id ? coupon : c);
    
    this.couponsSubject.next(updatedCoupons);
    this.saveCoupons(updatedCoupons);
    
    this.toastr.success('Coupon updated successfully', 'Coupon Updated');
    return of(coupon);
  }

  deleteCoupon(couponId: number): Observable<boolean> {
    const currentCoupons = this.couponsSubject.value;
    const updatedCoupons = currentCoupons.filter(c => c.id !== couponId);
    
    this.couponsSubject.next(updatedCoupons);
    this.saveCoupons(updatedCoupons);
    
    this.toastr.success('Coupon deleted successfully', 'Coupon Deleted');
    return of(true);
  }

  getCouponsByCategory(category: string): Observable<Coupon[]> {
    return this.coupons$.pipe(
      map(coupons => coupons.filter(c => c.isApplicableToCategory(category)))
    );
  }

  getActiveCoupons(): Observable<Coupon[]> {
    return this.coupons$.pipe(
      map(coupons => coupons.filter(c => c.isValid()))
    );
  }

  getExpiringCoupons(days: number = 7): Observable<Coupon[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return this.coupons$.pipe(
      map(coupons => coupons.filter(c => 
        c.isValid() && c.validUntil <= cutoffDate
      ))
    );
  }

  searchCoupons(query: string): Observable<Coupon[]> {
    const searchTerm = query.toLowerCase();
    return this.coupons$.pipe(
      map(coupons => coupons.filter(c => 
        c.name.toLowerCase().includes(searchTerm) ||
        c.code.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm)
      ))
    );
  }

  getCouponStats(): Observable<{ total: number; active: number; expired: number; used: number }> {
    return this.coupons$.pipe(
      map(coupons => {
        const total = coupons.length;
        const active = coupons.filter(c => c.isValid()).length;
        const expired = coupons.filter(c => !c.isValid()).length;
        const used = coupons.reduce((sum, c) => sum + c.usedCount, 0);
        
        return { total, active, expired, used };
      })
    );
  }
}
