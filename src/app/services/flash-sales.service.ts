import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export interface FlashSale {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startTime: Date;
  endTime: Date;
  productIds: number[];
  isActive: boolean;
  imageUrl?: string;
  originalPrice: number;
  salePrice: number;
  countdown?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FlashSalesService {
  private flashSalesSubject = new BehaviorSubject<FlashSale[]>([]);
  public flashSales$ = this.flashSalesSubject.asObservable();

  private activeFlashSalesSubject = new BehaviorSubject<FlashSale[]>([]);
  public activeFlashSales$ = this.activeFlashSalesSubject.asObservable();

  constructor() {
    this.initializeFlashSales();
    this.startFlashSaleTimer();
  }

  private initializeFlashSales(): void {
    const now = new Date();
    const flashSales: FlashSale[] = [
      {
        id: 'flash-1',
        title: 'Tech Gadgets Flash Sale',
        description: 'Up to 50% off on premium tech gadgets',
        discountPercentage: 50,
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Started 2 hours ago
        endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // Ends in 4 hours
        productIds: [1, 2, 3, 4],
        isActive: true,
        imageUrl: 'assets/images/flash-sale-tech.jpg',
        originalPrice: 2999,
        salePrice: 1499
      },
      {
        id: 'flash-2',
        title: 'Fashion Frenzy',
        description: 'Trendy fashion items at unbeatable prices',
        discountPercentage: 40,
        startTime: new Date(now.getTime() + 1 * 60 * 60 * 1000), // Starts in 1 hour
        endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // Ends in 6 hours
        productIds: [5, 6, 7, 8],
        isActive: false,
        imageUrl: 'assets/images/flash-sale-fashion.jpg',
        originalPrice: 1999,
        salePrice: 1199
      },
      {
        id: 'flash-3',
        title: 'Home & Living',
        description: 'Transform your home with amazing deals',
        discountPercentage: 35,
        startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Started 1 hour ago
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // Ends in 3 hours
        productIds: [9, 10, 11, 12],
        isActive: true,
        imageUrl: 'assets/images/flash-sale-home.jpg',
        originalPrice: 2499,
        salePrice: 1624
      }
    ];

    this.flashSalesSubject.next(flashSales);
    this.updateActiveFlashSales();
  }

  private startFlashSaleTimer(): void {
    // Update flash sales every minute
    interval(60000).subscribe(() => {
      this.updateActiveFlashSales();
    });
  }

  private updateActiveFlashSales(): void {
    const now = new Date();
    const allFlashSales = this.flashSalesSubject.value;
    
    const activeFlashSales = allFlashSales.map(sale => {
      const isActive = now >= sale.startTime && now <= sale.endTime;
      let countdown = undefined;
      
      if (isActive) {
        const timeLeft = sale.endTime.getTime() - now.getTime();
        if (timeLeft > 0) {
          countdown = {
            hours: Math.floor(timeLeft / (1000 * 60 * 60)),
            minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((timeLeft % (1000 * 60)) / 1000)
          };
        }
      }
      
      return {
        ...sale,
        isActive,
        countdown
      };
    });

    this.flashSalesSubject.next(activeFlashSales);
    this.activeFlashSalesSubject.next(activeFlashSales.filter(sale => sale.isActive));
  }

  getActiveFlashSales(): FlashSale[] {
    return this.activeFlashSalesSubject.value;
  }

  getUpcomingFlashSales(): FlashSale[] {
    const now = new Date();
    return this.flashSalesSubject.value.filter(sale => sale.startTime > now);
  }

  getFlashSaleById(id: string): FlashSale | undefined {
    return this.flashSalesSubject.value.find(sale => sale.id === id);
  }

  getFlashSaleCountdown(saleId: string): Observable<{ hours: number; minutes: number; seconds: number } | null> {
    const sale = this.getFlashSaleById(saleId);
    if (!sale) {
      return new Observable(subscriber => subscriber.next(null));
    }

    return timer(0, 1000).pipe(
      map(() => {
        const now = new Date();
        const endTime = new Date(sale.endTime);
        const timeLeft = endTime.getTime() - now.getTime();

        if (timeLeft <= 0) {
          this.updateActiveFlashSales();
          return null;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
      }),
      takeWhile(countdown => countdown !== null, true)
    );
  }

  isFlashSaleActive(saleId: string): boolean {
    const sale = this.getFlashSaleById(saleId);
    return sale ? sale.isActive : false;
  }

  getFlashSaleProducts(saleId: string): number[] {
    const sale = this.getFlashSaleById(saleId);
    return sale ? sale.productIds : [];
  }

  createFlashSale(flashSale: Omit<FlashSale, 'id'>): void {
    const newFlashSale: FlashSale = {
      ...flashSale,
      id: `flash-${Date.now()}`
    };

    const currentFlashSales = this.flashSalesSubject.value;
    this.flashSalesSubject.next([...currentFlashSales, newFlashSale]);
    this.updateActiveFlashSales();
  }

  updateFlashSale(id: string, updates: Partial<FlashSale>): void {
    const currentFlashSales = this.flashSalesSubject.value;
    const updatedFlashSales = currentFlashSales.map(sale =>
      sale.id === id ? { ...sale, ...updates } : sale
    );

    this.flashSalesSubject.next(updatedFlashSales);
    this.updateActiveFlashSales();
  }

  deleteFlashSale(id: string): void {
    const currentFlashSales = this.flashSalesSubject.value;
    const filteredFlashSales = currentFlashSales.filter(sale => sale.id !== id);
    
    this.flashSalesSubject.next(filteredFlashSales);
    this.updateActiveFlashSales();
  }
}
