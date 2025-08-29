import { Product } from './product.model';

export class Review {
  constructor(
    public id: string,
    public productId: number,
    public userId: string,
    public userName: string,
    public rating: number,
    public title: string,
    public comment: string,
    public isVerified: boolean = false,
    public helpfulCount: number = 0,
    public unhelpfulCount: number = 0,
    public images: string[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  getRatingStars(): string {
    return '★'.repeat(Math.floor(this.rating)) + '☆'.repeat(5 - Math.floor(this.rating));
  }

  getFormattedRating(): string {
    return this.rating.toFixed(1);
  }

  getFormattedDate(): string {
    return this.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRelativeDate(): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  getHelpfulPercentage(): number {
    const total = this.helpfulCount + this.unhelpfulCount;
    if (total === 0) return 0;
    return Math.round((this.helpfulCount / total) * 100);
  }

  getHelpfulText(): string {
    const percentage = this.getHelpfulPercentage();
    if (percentage === 0) return 'No votes yet';
    return `${percentage}% found this helpful`;
  }

  hasImages(): boolean {
    return this.images.length > 0;
  }

  getImageCount(): number {
    return this.images.length;
  }

  isRecent(): boolean {
    const now = new Date();
    const diffTime = now.getTime() - this.createdAt.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 30; // Recent if within 30 days
  }

  toJson(): any {
    return {
      id: this.id,
      productId: this.productId,
      userId: this.userId,
      userName: this.userName,
      rating: this.rating,
      title: this.title,
      comment: this.comment,
      isVerified: this.isVerified,
      helpfulCount: this.helpfulCount,
      unhelpfulCount: this.unhelpfulCount,
      images: this.images,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJson(json: any): Review {
    return new Review(
      json.id,
      json.productId,
      json.userId,
      json.userName,
      json.rating,
      json.title,
      json.comment,
      json.isVerified || false,
      json.helpfulCount || 0,
      json.unhelpfulCount || 0,
      json.images || [],
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}

export class ReviewSummary {
  constructor(
    public productId: number,
    public averageRating: number,
    public totalReviews: number,
    public ratingDistribution: { [key: number]: number } = {},
    public verifiedReviews: number = 0,
    public recentReviews: number = 0
  ) {}

  getFormattedAverageRating(): string {
    return this.averageRating.toFixed(1);
  }

  getRatingStars(): string {
    return '★'.repeat(Math.floor(this.averageRating)) + '☆'.repeat(5 - Math.floor(this.averageRating));
  }

  getRatingPercentage(rating: number): number {
    if (this.totalReviews === 0) return 0;
    const count = this.ratingDistribution[rating] || 0;
    return Math.round((count / this.totalReviews) * 100);
  }

  getVerifiedPercentage(): number {
    if (this.totalReviews === 0) return 0;
    return Math.round((this.verifiedReviews / this.totalReviews) * 100);
  }

  getRecentPercentage(): number {
    if (this.totalReviews === 0) return 0;
    return Math.round((this.recentReviews / this.totalReviews) * 100);
  }

  toJson(): any {
    return {
      productId: this.productId,
      averageRating: this.averageRating,
      totalReviews: this.totalReviews,
      ratingDistribution: this.ratingDistribution,
      verifiedReviews: this.verifiedReviews,
      recentReviews: this.recentReviews
    };
  }

  static fromJson(json: any): ReviewSummary {
    return new ReviewSummary(
      json.productId,
      json.averageRating,
      json.totalReviews,
      json.ratingDistribution || {},
      json.verifiedReviews || 0,
      json.recentReviews || 0
    );
  }
}

export class ReviewRequest {
  constructor(
    public productId: number,
    public rating: number,
    public title: string,
    public comment: string,
    public images: string[] = []
  ) {}

  isValid(): boolean {
    return this.rating >= 1 && 
           this.rating <= 5 && 
           this.title.trim().length > 0 && 
           this.comment.trim().length > 0;
  }

  toJson(): any {
    return {
      productId: this.productId,
      rating: this.rating,
      title: this.title,
      comment: this.comment,
      images: this.images
    };
  }

  static fromJson(json: any): ReviewRequest {
    return new ReviewRequest(
      json.productId,
      json.rating,
      json.title,
      json.comment,
      json.images || []
    );
  }
}
 