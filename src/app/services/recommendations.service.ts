import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { RecentlyViewedService } from './recently-viewed.service';
import { WishlistService } from './wishlist.service';

@Injectable({
  providedIn: 'root'
})
export class RecommendationsService {

  constructor(
    private recentlyViewedService: RecentlyViewedService,
    private wishlistService: WishlistService
  ) {}

  getPersonalizedRecommendations(allProducts: Product[], limit: number = 8): Observable<Product[]> {
    const recentlyViewed = this.recentlyViewedService.getRecentlyViewed();
    const wishlist = this.wishlistService.getWishlist();
    
    // Get user preferences from recently viewed and wishlist
    const userCategories = this.getUserCategories(recentlyViewed, wishlist);
    const userPriceRange = this.getUserPriceRange(recentlyViewed, wishlist);
    
    // Filter and score products
    const scoredProducts = allProducts
      .filter(product => !recentlyViewed.some(rv => rv.id === product.id)) // Exclude recently viewed
      .map(product => ({
        product,
        score: this.calculateRecommendationScore(product, userCategories, userPriceRange, recentlyViewed)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

    return of(scoredProducts);
  }

  getSimilarProducts(product: Product, allProducts: Product[], limit: number = 4): Observable<Product[]> {
    const similarProducts = allProducts
      .filter(p => p.id !== product.id && p.category === product.category)
      .map(p => ({
        product: p,
        score: this.calculateSimilarityScore(p, product)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

    return of(similarProducts);
  }

  getTrendingProducts(allProducts: Product[], limit: number = 6): Observable<Product[]> {
    // Simulate trending products based on popularity
    const trendingProducts = allProducts
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);

    return of(trendingProducts);
  }

  getFlashSaleProducts(allProducts: Product[], limit: number = 4): Observable<Product[]> {
    // Simulate flash sale products (high discount, limited time)
    const flashSaleProducts = allProducts
      .filter(product => product.hasDiscount() && product.getDiscountPercentage() > 20) // High discount
      .sort((a, b) => b.getDiscountPercentage() - a.getDiscountPercentage())
      .slice(0, limit);

    return of(flashSaleProducts);
  }

  private getUserCategories(recentlyViewed: Product[], wishlist: Product[]): string[] {
    const categories = new Map<string, number>();
    
    [...recentlyViewed, ...wishlist].forEach(product => {
      const count = categories.get(product.category) || 0;
      categories.set(product.category, count + 1);
    });
    
    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
  }

  private getUserPriceRange(recentlyViewed: Product[], wishlist: Product[]): { min: number; max: number } {
    const allPrices = [...recentlyViewed, ...wishlist].map(p => p.price);
    
    if (allPrices.length === 0) {
      return { min: 0, max: 1000 };
    }
    
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    
    return { min, max };
  }

  private calculateRecommendationScore(
    product: Product, 
    userCategories: string[], 
    userPriceRange: { min: number; max: number },
    recentlyViewed: Product[]
  ): number {
    let score = 0;
    
    // Category preference
    if (userCategories.includes(product.category)) {
      score += 10;
    }
    
    // Price range preference
    if (product.price >= userPriceRange.min && product.price <= userPriceRange.max) {
      score += 5;
    }
    
    // Rating
    score += (product.rating || 0) * 2;
    
    // Discount
    if (product.hasDiscount()) {
      score += product.getDiscountPercentage();
    }
    
    // Popularity (based on reviews)
    score += (product.reviews || 0) * 0.1;
    
    return score;
  }

  private calculateSimilarityScore(product1: Product, product2: Product): number {
    let score = 0;
    
    // Same category
    if (product1.category === product2.category) {
      score += 10;
    }
    
    // Similar price range
    const priceDiff = Math.abs(product1.price - product2.price);
    if (priceDiff < 50) {
      score += 5;
    }
    
    // Similar rating
    const ratingDiff = Math.abs((product1.rating || 0) - (product2.rating || 0));
    if (ratingDiff < 1) {
      score += 3;
    }
    
    return score;
  }
}
