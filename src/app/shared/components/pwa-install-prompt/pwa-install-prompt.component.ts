import { Component, OnInit, OnDestroy } from '@angular/core';
import { PwaService } from '../../../services/pwa.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pwa-install-prompt',
  templateUrl: './pwa-install-prompt.component.html',
  styleUrls: ['./pwa-install-prompt.component.scss']
})
export class PwaInstallPromptComponent implements OnInit, OnDestroy {
  showPrompt = false;
  isOnline = true;
  updateAvailable = false;
  private destroy$ = new Subject<void>();

  constructor(private pwaService: PwaService) {}

  ngOnInit(): void {
    // Check if PWA is already installed
    if (!this.pwaService.isPWAInstalled()) {
      this.showPrompt = true;
    }

    // Monitor online status
    this.pwaService.isOnline
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        this.isOnline = isOnline;
      });

    // Monitor update availability
    this.pwaService.updateAvailable
      .pipe(takeUntil(this.destroy$))
      .subscribe(updateAvailable => {
        this.updateAvailable = updateAvailable;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  installPWA(): void {
    this.pwaService.installPWA();
    this.showPrompt = false;
  }

  updateApp(): void {
    this.pwaService.activateUpdate();
  }

  dismissPrompt(): void {
    this.showPrompt = false;
  }

  dismissUpdate(): void {
    this.updateAvailable = false;
  }
}
