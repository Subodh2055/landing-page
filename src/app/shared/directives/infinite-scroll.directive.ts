import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]'
})
export class InfiniteScrollDirective {
  @Input() threshold = 100; // Distance from bottom to trigger load
  @Input() disabled = false;
  @Output() scrolled = new EventEmitter<void>();

  private isLoading = false;

  constructor(private elementRef: ElementRef) {}

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    if (this.disabled || this.isLoading) {
      return;
    }

    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // Check if we're near the bottom
    if (scrollTop + clientHeight >= scrollHeight - this.threshold) {
      this.isLoading = true;
      this.scrolled.emit();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    // Recalculate scroll position on window resize
    this.onScroll({ target: this.elementRef.nativeElement } as any);
  }

  // Method to reset loading state
  resetLoading(): void {
    this.isLoading = false;
  }
}
