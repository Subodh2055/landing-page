import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplashScreenService {
  private showSplashSubject = new BehaviorSubject<boolean>(true);
  public showSplash$: Observable<boolean> = this.showSplashSubject.asObservable();

  constructor() {
    // Auto-hide splash screen after 3 seconds as fallback
    setTimeout(() => {
      this.hideSplash();
    }, 3000);
  }

  showSplash(): void {
    this.showSplashSubject.next(true);
  }

  hideSplash(): void {
    this.showSplashSubject.next(false);
  }

  isSplashVisible(): boolean {
    return this.showSplashSubject.value;
  }

  // Method to simulate loading time
  simulateLoading(duration: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.hideSplash();
        resolve();
      }, duration);
    });
  }
}
