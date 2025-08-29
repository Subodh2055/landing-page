import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { 
  ProductExperience, 
  ProductImage, 
  ProductVideo, 
  ProductQuestion, 
  ProductAnswer, 
  ProductSpecification, 
  ProductComparison 
} from '../models/product-experience.model';
import { Review, ReviewSummary } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ProductExperienceService {
  private productExperienceSubject = new BehaviorSubject<ProductExperience | null>(null);
  public productExperience$ = this.productExperienceSubject.asObservable();

  private comparisonSubject = new BehaviorSubject<ProductComparison | null>(null);
  public comparison$ = this.comparisonSubject.asObservable();

  constructor() {
    this.initializeComparison();
  }

  // Product Experience Management
  loadProductExperience(productId: number): Observable<ProductExperience> {
    // Mock data - replace with actual API call
    const mockExperience = this.generateMockProductExperience(productId);
    this.productExperienceSubject.next(mockExperience);
    return of(mockExperience).pipe(delay(500));
  }

  // Image Carousel & Zoom
  getProductImages(productId: number): Observable<ProductImage[]> {
    return this.loadProductExperience(productId).pipe(
      map(experience => experience.getSortedImages())
    );
  }

  getProductVideos(productId: number): Observable<ProductVideo[]> {
    return this.loadProductExperience(productId).pipe(
      map(experience => experience.getSortedVideos())
    );
  }

  // Reviews & Ratings
  getProductReviews(productId: number, page: number = 1, limit: number = 10): Observable<Review[]> {
    return this.loadProductExperience(productId).pipe(
      map(experience => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return experience.reviews.slice(start, end);
      })
    );
  }

  getReviewSummary(productId: number): Observable<ReviewSummary> {
    return this.loadProductExperience(productId).pipe(
      map(experience => experience.reviewSummary)
    );
  }

  submitReview(review: Review): Observable<Review> {
    // Mock API call - replace with actual implementation
    return of(review).pipe(delay(1000));
  }

  // Q&A Section
  getProductQuestions(productId: number, page: number = 1, limit: number = 10): Observable<ProductQuestion[]> {
    return this.loadProductExperience(productId).pipe(
      map(experience => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return experience.questions.slice(start, end);
      })
    );
  }

  submitQuestion(question: ProductQuestion): Observable<ProductQuestion> {
    // Mock API call - replace with actual implementation
    return of(question).pipe(delay(1000));
  }

  submitAnswer(answer: ProductAnswer): Observable<ProductAnswer> {
    // Mock API call - replace with actual implementation
    return of(answer).pipe(delay(1000));
  }

  // Product Specifications
  getProductSpecifications(productId: number): Observable<ProductSpecification[]> {
    return this.loadProductExperience(productId).pipe(
      map(experience => experience.getSortedSpecifications())
    );
  }

  // Product Comparison
  private initializeComparison(): void {
    const savedComparison = localStorage.getItem('product_comparison');
    if (savedComparison) {
      try {
        const comparison = ProductComparison.fromJson(JSON.parse(savedComparison));
        this.comparisonSubject.next(comparison);
      } catch (error) {
        console.error('Error loading saved comparison:', error);
        this.clearComparison();
      }
    }
  }

  addToComparison(product: Product): void {
    let comparison = this.comparisonSubject.value;
    if (!comparison) {
      comparison = new ProductComparison(
        'comparison-' + Date.now(),
        'user-' + Date.now(),
        []
      );
    }
    
    comparison.addProduct(product);
    this.comparisonSubject.next(comparison);
    this.saveComparison(comparison);
  }

  removeFromComparison(productId: number): void {
    const comparison = this.comparisonSubject.value;
    if (comparison) {
      comparison.removeProduct(productId);
      this.comparisonSubject.next(comparison);
      this.saveComparison(comparison);
    }
  }

  clearComparison(): void {
    const comparison = this.comparisonSubject.value;
    if (comparison) {
      comparison.clearComparison();
      this.comparisonSubject.next(comparison);
      this.saveComparison(comparison);
    }
  }

  private saveComparison(comparison: ProductComparison): void {
    try {
      localStorage.setItem('product_comparison', JSON.stringify(comparison.toJson()));
    } catch (error) {
      console.error('Error saving comparison:', error);
    }
  }

  // Mock Data Generation
  private generateMockProductExperience(productId: number): ProductExperience {
    const product = new Product(
      productId,
      `Product ${productId}`,
      `This is a detailed description for product ${productId}`,
      1500 + (productId * 100),
      'Electronics',
      `https://picsum.photos/400/400?random=${productId}`,
      50,
      4.2,
      25
    );

    const images: ProductImage[] = [
      new ProductImage(`img-${productId}-1`, productId, `https://picsum.photos/800/800?random=${productId}1`, 'Main product image', true, 1),
      new ProductImage(`img-${productId}-2`, productId, `https://picsum.photos/800/800?random=${productId}2`, 'Product side view', false, 2),
      new ProductImage(`img-${productId}-3`, productId, `https://picsum.photos/800/800?random=${productId}3`, 'Product back view', false, 3),
      new ProductImage(`img-${productId}-4`, productId, `https://picsum.photos/800/800?random=${productId}4`, 'Product detail', false, 4)
    ];

    const videos: ProductVideo[] = [
      new ProductVideo(
        `video-${productId}-1`,
        productId,
        'Product Demo',
        'Watch how this product works',
        'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        `https://picsum.photos/400/225?random=${productId}5`,
        120,
        'product_demo',
        1
      ),
      new ProductVideo(
        `video-${productId}-2`,
        productId,
        'Unboxing Video',
        'See what comes in the box',
        'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        `https://picsum.photos/400/225?random=${productId}6`,
        180,
        'unboxing',
        2
      )
    ];

    const reviews: Review[] = [
      new Review(`review-${productId}-1`, productId, 'user1', 'John Doe', 5, 'Excellent product!', 'Great quality and fast delivery.', true, 15, 2),
      new Review(`review-${productId}-2`, productId, 'user2', 'Jane Smith', 4, 'Very good', 'Good product, meets expectations.', false, 8, 1),
      new Review(`review-${productId}-3`, productId, 'user3', 'Mike Johnson', 5, 'Amazing!', 'Exceeded my expectations. Highly recommended!', true, 12, 0),
      new Review(`review-${productId}-4`, productId, 'user4', 'Sarah Wilson', 3, 'Okay product', 'It\'s okay, nothing special.', false, 3, 2),
      new Review(`review-${productId}-5`, productId, 'user5', 'David Brown', 5, 'Perfect!', 'Exactly what I was looking for.', true, 20, 1)
    ];

    const reviewSummary = new ReviewSummary(
      productId,
      4.4,
      25,
      { 1: 1, 2: 2, 3: 3, 4: 8, 5: 11 },
      15,
      8
    );

    const questions: ProductQuestion[] = [
      new ProductQuestion(
        `question-${productId}-1`,
        productId,
        'user1',
        'John Doe',
        'Does this product come with a warranty?',
        true,
        5,
        1,
        [
          new ProductAnswer(
            `answer-${productId}-1`,
            `question-${productId}-1`,
            'seller1',
            'Official Seller',
            'seller',
            'Yes, this product comes with a 1-year manufacturer warranty.',
            true,
            12,
            0
          )
        ]
      ),
      new ProductQuestion(
        `question-${productId}-2`,
        productId,
        'user2',
        'Jane Smith',
        'What are the dimensions of this product?',
        false,
        3,
        0,
        [
          new ProductAnswer(
            `answer-${productId}-2`,
            `question-${productId}-2`,
            'user3',
            'Mike Johnson',
            'customer',
            'The dimensions are 10" x 8" x 2". I measured it myself.',
            false,
            8,
            1
          )
        ]
      )
    ];

    const specifications: ProductSpecification[] = [
      new ProductSpecification(`spec-${productId}-1`, productId, 'General', 'Brand', 'Brand Name', undefined, 1),
      new ProductSpecification(`spec-${productId}-2`, productId, 'General', 'Model', `Model-${productId}`, undefined, 2),
      new ProductSpecification(`spec-${productId}-3`, productId, 'Dimensions', 'Length', '10', 'inches', 3),
      new ProductSpecification(`spec-${productId}-4`, productId, 'Dimensions', 'Width', '8', 'inches', 4),
      new ProductSpecification(`spec-${productId}-5`, productId, 'Dimensions', 'Height', '2', 'inches', 5),
      new ProductSpecification(`spec-${productId}-6`, productId, 'Weight', 'Product Weight', '1.5', 'lbs', 6),
      new ProductSpecification(`spec-${productId}-7`, productId, 'Warranty', 'Warranty Period', '1', 'year', 7),
      new ProductSpecification(`spec-${productId}-8`, productId, 'Warranty', 'Warranty Type', 'Manufacturer', undefined, 8)
    ];

    return new ProductExperience(
      product,
      images,
      videos,
      reviews,
      reviewSummary,
      questions,
      specifications
    );
  }

  // Utility Methods
  isInComparison(productId: number): boolean {
    const comparison = this.comparisonSubject.value;
    return comparison ? comparison.products.some(p => p.id === productId) : false;
  }

  getComparisonCount(): number {
    const comparison = this.comparisonSubject.value;
    return comparison ? comparison.getProductCount() : 0;
  }

  canAddToComparison(): boolean {
    const comparison = this.comparisonSubject.value;
    return comparison ? comparison.getProductCount() < 4 : true; // Max 4 products
  }
}
