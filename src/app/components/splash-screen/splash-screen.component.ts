import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreenService } from '../../services/splash-screen.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  loadingProgress = 0;
  loadingText = 'Initializing...';
  showSplash = true;
  private loadingInterval: any;

  constructor(
    private router: Router,
    private splashScreenService: SplashScreenService
  ) {}

  ngOnInit() {
    this.startLoadingAnimation();
    
    // Subscribe to splash screen service
    this.splashScreenService.showSplash$.subscribe(show => {
      this.showSplash = show;
    });
  }

  ngOnDestroy() {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
  }

  private startLoadingAnimation() {
    const loadingSteps = [
      { progress: 20, text: 'Loading assets...' },
      { progress: 40, text: 'Preparing components...' },
      { progress: 60, text: 'Initializing services...' },
      { progress: 80, text: 'Setting up routes...' },
      { progress: 95, text: 'Almost ready...' },
      { progress: 100, text: 'Welcome!' }
    ];

    let currentStep = 0;
    
    this.loadingInterval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        this.loadingProgress = step.progress;
        this.loadingText = step.text;
        currentStep++;
      } else {
        clearInterval(this.loadingInterval);
        this.completeLoading();
      }
    }, 800);
  }

  private completeLoading() {
    setTimeout(() => {
      this.splashScreenService.hideSplash();
    }, 1000);
  }
}
