import { Product } from './product.model';
import { Review, ReviewSummary } from './review.model';

export class ProductImage {
  constructor(
    public id: string,
    public productId: number,
    public url: string,
    public altText: string,
    public isPrimary: boolean = false,
    public order: number = 0,
    public thumbnailUrl?: string,
    public zoomUrl?: string
  ) {}

  getThumbnailUrl(): string {
    return this.thumbnailUrl || this.url;
  }

  getZoomUrl(): string {
    return this.zoomUrl || this.url;
  }

  toJson(): any {
    return {
      id: this.id,
      productId: this.productId,
      url: this.url,
      altText: this.altText,
      isPrimary: this.isPrimary,
      order: this.order,
      thumbnailUrl: this.thumbnailUrl,
      zoomUrl: this.zoomUrl
    };
  }

  static fromJson(json: any): ProductImage {
    return new ProductImage(
      json.id,
      json.productId,
      json.url,
      json.altText,
      json.isPrimary || false,
      json.order || 0,
      json.thumbnailUrl,
      json.zoomUrl
    );
  }
}

export class ProductVideo {
  constructor(
    public id: string,
    public productId: number,
    public title: string,
    public description: string,
    public videoUrl: string,
    public thumbnailUrl: string,
    public duration: number, // in seconds
    public type: 'product_demo' | 'unboxing' | 'review' | 'tutorial' = 'product_demo',
    public order: number = 0
  ) {}

  getFormattedDuration(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  toJson(): any {
    return {
      id: this.id,
      productId: this.productId,
      title: this.title,
      description: this.description,
      videoUrl: this.videoUrl,
      thumbnailUrl: this.thumbnailUrl,
      duration: this.duration,
      type: this.type,
      order: this.order
    };
  }

  static fromJson(json: any): ProductVideo {
    return new ProductVideo(
      json.id,
      json.productId,
      json.title,
      json.description,
      json.videoUrl,
      json.thumbnailUrl,
      json.duration,
      json.type || 'product_demo',
      json.order || 0
    );
  }
}

export class ProductQuestion {
  constructor(
    public id: string,
    public productId: number,
    public userId: string,
    public userName: string,
    public question: string,
    public isVerified: boolean = false,
    public helpfulCount: number = 0,
    public unhelpfulCount: number = 0,
    public answers: ProductAnswer[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

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

  getAnswerCount(): number {
    return this.answers.length;
  }

  hasVerifiedAnswer(): boolean {
    return this.answers.some(answer => answer.isVerified);
  }

  getBestAnswer(): ProductAnswer | undefined {
    return this.answers.find(answer => answer.isVerified) || 
           this.answers.sort((a, b) => b.helpfulCount - a.helpfulCount)[0];
  }

  toJson(): any {
    return {
      id: this.id,
      productId: this.productId,
      userId: this.userId,
      userName: this.userName,
      question: this.question,
      isVerified: this.isVerified,
      helpfulCount: this.helpfulCount,
      unhelpfulCount: this.unhelpfulCount,
      answers: this.answers.map(answer => answer.toJson()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJson(json: any): ProductQuestion {
    return new ProductQuestion(
      json.id,
      json.productId,
      json.userId,
      json.userName,
      json.question,
      json.isVerified || false,
      json.helpfulCount || 0,
      json.unhelpfulCount || 0,
      json.answers?.map((answer: any) => ProductAnswer.fromJson(answer)) || [],
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}

export class ProductAnswer {
  constructor(
    public id: string,
    public questionId: string,
    public userId: string,
    public userName: string,
    public userRole: 'customer' | 'seller' | 'admin' = 'customer',
    public answer: string,
    public isVerified: boolean = false,
    public helpfulCount: number = 0,
    public unhelpfulCount: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

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

  getRoleBadge(): string {
    switch (this.userRole) {
      case 'seller': return 'Seller';
      case 'admin': return 'Admin';
      default: return 'Customer';
    }
  }

  getRoleColor(): string {
    switch (this.userRole) {
      case 'seller': return '#27ae60'; // Green
      case 'admin': return '#e74c3c'; // Red
      default: return '#3498db'; // Blue
    }
  }

  toJson(): any {
    return {
      id: this.id,
      questionId: this.questionId,
      userId: this.userId,
      userName: this.userName,
      userRole: this.userRole,
      answer: this.answer,
      isVerified: this.isVerified,
      helpfulCount: this.helpfulCount,
      unhelpfulCount: this.unhelpfulCount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJson(json: any): ProductAnswer {
    return new ProductAnswer(
      json.id,
      json.questionId,
      json.userId,
      json.userName,
      json.userRole || 'customer',
      json.answer,
      json.isVerified || false,
      json.helpfulCount || 0,
      json.unhelpfulCount || 0,
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}

export class ProductSpecification {
  constructor(
    public id: string,
    public productId: number,
    public category: string,
    public name: string,
    public value: string,
    public unit?: string,
    public order: number = 0
  ) {}

  getFullValue(): string {
    return this.unit ? `${this.value} ${this.unit}` : this.value;
  }

  toJson(): any {
    return {
      id: this.id,
      productId: this.productId,
      category: this.category,
      name: this.name,
      value: this.value,
      unit: this.unit,
      order: this.order
    };
  }

  static fromJson(json: any): ProductSpecification {
    return new ProductSpecification(
      json.id,
      json.productId,
      json.category,
      json.name,
      json.value,
      json.unit,
      json.order || 0
    );
  }
}

export class ProductComparison {
  constructor(
    public id: string,
    public userId: string,
    public products: Product[],
    public specifications: { [productId: number]: ProductSpecification[] } = {},
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  getProductCount(): number {
    return this.products.length;
  }

  addProduct(product: Product): void {
    if (!this.products.find(p => p.id === product.id)) {
      this.products.push(product);
      this.updatedAt = new Date();
    }
  }

  removeProduct(productId: number): void {
    this.products = this.products.filter(p => p.id !== productId);
    delete this.specifications[productId];
    this.updatedAt = new Date();
  }

  clearComparison(): void {
    this.products = [];
    this.specifications = {};
    this.updatedAt = new Date();
  }

  getSpecificationCategories(): string[] {
    const categories = new Set<string>();
    Object.values(this.specifications).forEach(specs => {
      specs.forEach(spec => categories.add(spec.category));
    });
    return Array.from(categories).sort();
  }

  getSpecificationsByCategory(category: string): { [productId: number]: ProductSpecification } {
    const result: { [productId: number]: ProductSpecification } = {};
    Object.entries(this.specifications).forEach(([productId, specs]) => {
      const categorySpec = specs.find(spec => spec.category === category);
      if (categorySpec) {
        result[Number(productId)] = categorySpec;
      }
    });
    return result;
  }

  toJson(): any {
    return {
      id: this.id,
      userId: this.userId,
      products: this.products.map(product => product.toJson()),
      specifications: this.specifications,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromJson(json: any): ProductComparison {
    return new ProductComparison(
      json.id,
      json.userId,
      json.products?.map((product: any) => Product.fromJson(product)) || [],
      json.specifications || {},
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
}

export class ProductExperience {
  constructor(
    public product: Product,
    public images: ProductImage[] = [],
    public videos: ProductVideo[] = [],
    public reviews: Review[] = [],
    public reviewSummary: ReviewSummary,
    public questions: ProductQuestion[] = [],
    public specifications: ProductSpecification[] = []
  ) {}

  getPrimaryImage(): ProductImage | undefined {
    return this.images.find(img => img.isPrimary) || this.images[0];
  }

  getSortedImages(): ProductImage[] {
    return this.images.sort((a, b) => a.order - b.order);
  }

  getSortedVideos(): ProductVideo[] {
    return this.videos.sort((a, b) => a.order - b.order);
  }

  getSortedSpecifications(): ProductSpecification[] {
    return this.specifications.sort((a, b) => a.order - b.order);
  }

  getSpecificationCategories(): string[] {
    const categories = new Set<string>();
    this.specifications.forEach(spec => categories.add(spec.category));
    return Array.from(categories).sort();
  }

  getSpecificationsByCategory(category: string): ProductSpecification[] {
    return this.specifications
      .filter(spec => spec.category === category)
      .sort((a, b) => a.order - b.order);
  }

  getTopQuestions(limit: number = 5): ProductQuestion[] {
    return this.questions
      .sort((a, b) => b.answers.length - a.answers.length)
      .slice(0, limit);
  }

  getRecentQuestions(limit: number = 5): ProductQuestion[] {
    return this.questions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  toJson(): any {
    return {
      product: this.product.toJson(),
      images: this.images.map(img => img.toJson()),
      videos: this.videos.map(video => video.toJson()),
      reviews: this.reviews.map(review => review.toJson()),
      reviewSummary: this.reviewSummary.toJson(),
      questions: this.questions.map(question => question.toJson()),
      specifications: this.specifications.map(spec => spec.toJson())
    };
  }

  static fromJson(json: any): ProductExperience {
    return new ProductExperience(
      Product.fromJson(json.product),
      json.images?.map((img: any) => ProductImage.fromJson(img)) || [],
      json.videos?.map((video: any) => ProductVideo.fromJson(video)) || [],
      json.reviews?.map((review: any) => Review.fromJson(review)) || [],
      ReviewSummary.fromJson(json.reviewSummary),
      json.questions?.map((question: any) => ProductQuestion.fromJson(question)) || [],
      json.specifications?.map((spec: any) => ProductSpecification.fromJson(spec)) || []
    );
  }
}
