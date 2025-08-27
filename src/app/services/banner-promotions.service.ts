import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BannerPromotion {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  priority: number; // Higher number = higher priority
  targetAudience: 'all' | 'new' | 'returning' | 'premium';
  categories?: string[];
  discountCode?: string;
  backgroundColor?: string;
  textColor?: string;
  position: 'top' | 'hero' | 'sidebar' | 'bottom';
}

@Injectable({
  providedIn: 'root'
})
export class BannerPromotionsService {
  private bannersSubject = new BehaviorSubject<BannerPromotion[]>([]);
  public banners$ = this.bannersSubject.asObservable();

  private activeBannersSubject = new BehaviorSubject<BannerPromotion[]>([]);
  public activeBanners$ = this.activeBannersSubject.asObservable();

  constructor() {
    this.initializeBanners();
    this.updateActiveBanners();
  }

  private initializeBanners(): void {
    const now = new Date();
    const banners: BannerPromotion[] = [
      {
        id: 'banner-1',
        title: 'Summer Sale',
        subtitle: 'Up to 70% Off',
        description: 'Get ready for summer with amazing deals on fashion, electronics, and more!',
        imageUrl: 'assets/images/banners/summer-sale.jpg',
        linkUrl: '/products?category=fashion&sale=true',
        buttonText: 'Shop Now',
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Started yesterday
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
        isActive: true,
        priority: 10,
        targetAudience: 'all',
        position: 'hero',
        backgroundColor: '#ff6b6b',
        textColor: '#ffffff'
      },
      {
        id: 'banner-2',
        title: 'New User Special',
        subtitle: '20% Off First Order',
        description: 'Welcome to ProductHub! Use code WELCOME20 for 20% off your first purchase.',
        imageUrl: 'assets/images/banners/new-user.jpg',
        linkUrl: '/products',
        buttonText: 'Start Shopping',
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Started a week ago
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Ends in 30 days
        isActive: true,
        priority: 8,
        targetAudience: 'new',
        discountCode: 'WELCOME20',
        position: 'top',
        backgroundColor: '#4ecdc4',
        textColor: '#ffffff'
      },
      {
        id: 'banner-3',
        title: 'Tech Deals',
        subtitle: 'Latest Gadgets',
        description: 'Discover the latest in technology with exclusive deals on smartphones, laptops, and accessories.',
        imageUrl: 'assets/images/banners/tech-deals.jpg',
        linkUrl: '/products?category=electronics',
        buttonText: 'Explore Tech',
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Ends in 5 days
        isActive: true,
        priority: 7,
        targetAudience: 'all',
        categories: ['electronics', 'gadgets'],
        position: 'sidebar',
        backgroundColor: '#45b7d1',
        textColor: '#ffffff'
      },
      {
        id: 'banner-4',
        title: 'Premium Member Benefits',
        subtitle: 'Exclusive Access',
        description: 'Unlock premium features and get early access to sales and new products.',
        imageUrl: 'assets/images/banners/premium.jpg',
        linkUrl: '/premium',
        buttonText: 'Upgrade Now',
        startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // Started 2 weeks ago
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // Ends in 60 days
        isActive: true,
        priority: 6,
        targetAudience: 'returning',
        position: 'bottom',
        backgroundColor: '#96ceb4',
        textColor: '#ffffff'
      }
    ];

    this.bannersSubject.next(banners);
  }

  private updateActiveBanners(): void {
    const now = new Date();
    const allBanners = this.bannersSubject.value;
    
    const activeBanners = allBanners
      .map(banner => ({
        ...banner,
        isActive: now >= banner.startDate && now <= banner.endDate
      }))
      .filter(banner => banner.isActive)
      .sort((a, b) => b.priority - a.priority);

    this.activeBannersSubject.next(activeBanners);
  }

  getActiveBanners(): BannerPromotion[] {
    return this.activeBannersSubject.value;
  }

  getBannersByPosition(position: BannerPromotion['position']): BannerPromotion[] {
    return this.getActiveBanners().filter(banner => banner.position === position);
  }

  getBannersByAudience(audience: BannerPromotion['targetAudience']): BannerPromotion[] {
    return this.getActiveBanners().filter(banner => 
      banner.targetAudience === audience || banner.targetAudience === 'all'
    );
  }

  getBannerById(id: string): BannerPromotion | undefined {
    return this.bannersSubject.value.find(banner => banner.id === id);
  }

  getHeroBanner(): BannerPromotion | undefined {
    return this.getBannersByPosition('hero')[0];
  }

  getTopBanners(): BannerPromotion[] {
    return this.getBannersByPosition('top');
  }

  getSidebarBanners(): BannerPromotion[] {
    return this.getBannersByPosition('sidebar');
  }

  getBottomBanners(): BannerPromotion[] {
    return this.getBannersByPosition('bottom');
  }

  createBanner(banner: Omit<BannerPromotion, 'id'>): void {
    const newBanner: BannerPromotion = {
      ...banner,
      id: `banner-${Date.now()}`
    };

    const currentBanners = this.bannersSubject.value;
    this.bannersSubject.next([...currentBanners, newBanner]);
    this.updateActiveBanners();
  }

  updateBanner(id: string, updates: Partial<BannerPromotion>): void {
    const currentBanners = this.bannersSubject.value;
    const updatedBanners = currentBanners.map(banner =>
      banner.id === id ? { ...banner, ...updates } : banner
    );

    this.bannersSubject.next(updatedBanners);
    this.updateActiveBanners();
  }

  deleteBanner(id: string): void {
    const currentBanners = this.bannersSubject.value;
    const filteredBanners = currentBanners.filter(banner => banner.id !== id);
    
    this.bannersSubject.next(filteredBanners);
    this.updateActiveBanners();
  }

  activateBanner(id: string): void {
    this.updateBanner(id, { isActive: true });
  }

  deactivateBanner(id: string): void {
    this.updateBanner(id, { isActive: false });
  }

  getBannersForUser(userType: 'new' | 'returning' | 'premium' | 'guest'): BannerPromotion[] {
    const allActiveBanners = this.getActiveBanners();
    
    return allActiveBanners.filter(banner => {
      // Always show 'all' audience banners
      if (banner.targetAudience === 'all') return true;
      
      // Show targeted banners based on user type
      switch (userType) {
        case 'new':
          return banner.targetAudience === 'new';
        case 'returning':
          return banner.targetAudience === 'returning';
        case 'premium':
          return banner.targetAudience === 'premium';
        case 'guest':
          return banner.targetAudience === 'new'; // Treat guests as new users
        default:
          return false;
      }
    });
  }
}
