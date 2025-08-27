import { Injectable, Inject, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private updateAvailable$ = new BehaviorSubject<boolean>(false);
  private isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor(
    @Optional() @Inject('SwUpdate') private swUpdate: any,
    @Optional() @Inject('SwPush') private swPush: any
  ) {
    this.initializePWA();
  }

  private initializePWA(): void {
    // Check for updates
    if (this.swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        this.updateAvailable$.next(true);
      });

      this.swUpdate.activated.subscribe(() => {
        console.log('App updated successfully');
      });
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline$.next(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline$.next(false);
    });
  }

  // Check for app updates
  checkForUpdate(): Promise<void> {
    if (this.swUpdate && this.swUpdate.isEnabled) {
      return this.swUpdate.checkForUpdate();
    }
    return Promise.resolve();
  }

  // Activate update
  activateUpdate(): Promise<void> {
    if (this.swUpdate && this.swUpdate.isEnabled) {
      return this.swUpdate.activateUpdate();
    }
    return Promise.resolve();
  }

  // Subscribe to push notifications
  subscribeToNotifications(): Promise<PushSubscription | null> {
    if (this.swPush && this.swPush.isEnabled) {
      return this.swPush.requestSubscription({
        serverPublicKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID public key
      });
    }
    return Promise.resolve(null);
  }

  // Get update availability status
  get updateAvailable(): Observable<boolean> {
    return this.updateAvailable$.asObservable();
  }

  // Get online status
  get isOnline(): Observable<boolean> {
    return this.isOnline$.asObservable();
  }

  // Check if PWA is installed
  isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Install PWA
  installPWA(): void {
    // This would typically be handled by the browser's install prompt
    // You can trigger it programmatically in some cases
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installed successfully');
        }
        (window as any).deferredPrompt = null;
      });
    }
  }

  // Cache data for offline use
  cacheData(key: string, data: any): void {
    if ('caches' in window) {
      caches.open('app-cache').then(cache => {
        cache.put(key, new Response(JSON.stringify(data)));
      });
    }
  }

  // Get cached data
  async getCachedData(key: string): Promise<any> {
    if ('caches' in window) {
      const cache = await caches.open('app-cache');
      const response = await cache.match(key);
      if (response) {
        return response.json();
      }
    }
    return null;
  }

  // Clear cache
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      await caches.delete('app-cache');
    }
  }
}
