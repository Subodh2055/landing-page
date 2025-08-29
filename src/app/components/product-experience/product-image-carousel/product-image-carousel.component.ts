import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductImage, ProductVideo } from '../../../models/product-experience.model';
import { ProductExperienceService } from '../../../services/product-experience.service';

@Component({
  selector: 'app-product-image-carousel',
  templateUrl: './product-image-carousel.component.html',
  styleUrls: ['./product-image-carousel.component.scss']
})
export class ProductImageCarouselComponent implements OnInit, OnDestroy {
  @Input() productId!: number;

  images: ProductImage[] = [];
  videos: ProductVideo[] = [];
  currentIndex = 0;
  showZoom = false;
  zoomPosition = { x: 0, y: 0 };
  zoomLevel = 2;
  isVideoPlaying = false;
  currentVideo: ProductVideo | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(private productExperienceService: ProductExperienceService) {}

  ngOnInit(): void {
    this.loadProductMedia();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProductMedia(): void {
    this.loading = true;
    
    // Load images
    this.productExperienceService.getProductImages(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(images => {
        this.images = images;
        this.loading = false;
      });

    // Load videos
    this.productExperienceService.getProductVideos(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(videos => {
        this.videos = videos;
      });
  }

  // Navigation
  next(): void {
    if (this.currentIndex < this.getTotalItems() - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.resetZoom();
  }

  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.getTotalItems() - 1;
    }
    this.resetZoom();
  }

  goToIndex(index: number): void {
    this.currentIndex = index;
    this.resetZoom();
  }

  // Zoom functionality
  onMouseMove(event: MouseEvent): void {
    if (!this.showZoom || this.isCurrentItemVideo()) return;

    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.zoomPosition = {
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    };
  }

  onMouseEnter(): void {
    if (!this.isCurrentItemVideo()) {
      this.showZoom = true;
    }
  }

  onMouseLeave(): void {
    this.showZoom = false;
  }

  resetZoom(): void {
    this.showZoom = false;
    this.zoomPosition = { x: 0, y: 0 };
  }

  // Video functionality
  playVideo(video: ProductVideo): void {
    this.currentVideo = video;
    this.isVideoPlaying = true;
  }

  closeVideo(): void {
    this.isVideoPlaying = false;
    this.currentVideo = null;
  }

  // Utility methods
  getTotalItems(): number {
    return this.images.length + this.videos.length;
  }

  getCurrentItem(): ProductImage | ProductVideo | null {
    const totalImages = this.images.length;
    if (this.currentIndex < totalImages) {
      return this.images[this.currentIndex];
    } else {
      return this.videos[this.currentIndex - totalImages];
    }
  }

  isCurrentItemVideo(): boolean {
    return this.currentIndex >= this.images.length;
  }

  isCurrentItemImage(): boolean {
    return this.currentIndex < this.images.length;
  }

  getCurrentImage(): ProductImage | null {
    if (this.isCurrentItemImage()) {
      return this.images[this.currentIndex];
    }
    return null;
  }

  getCurrentVideo(): ProductVideo | null {
    if (this.isCurrentItemVideo()) {
      return this.videos[this.currentIndex - this.images.length];
    }
    return null;
  }

  getZoomStyle(): any {
    if (!this.showZoom || this.isCurrentItemVideo()) return {};

    const currentImage = this.getCurrentImage();
    if (!currentImage) return {};

    return {
      backgroundImage: `url(${currentImage.getZoomUrl()})`,
      backgroundPosition: `${this.zoomPosition.x}% ${this.zoomPosition.y}%`,
      backgroundSize: `${this.zoomLevel * 100}%`
    };
  }

  // Thumbnail navigation
  getThumbnails(): (ProductImage | ProductVideo)[] {
    return [...this.images, ...this.videos];
  }

  isThumbnailActive(index: number): boolean {
    return this.currentIndex === index;
  }

  isThumbnailVideo(item: ProductImage | ProductVideo): boolean {
    return 'videoUrl' in item;
  }

  // Responsive helpers
  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  shouldShowZoom(): boolean {
    return this.showZoom && !this.isMobile() && this.isCurrentItemImage();
  }
}
