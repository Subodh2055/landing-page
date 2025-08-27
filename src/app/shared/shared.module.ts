import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { InfiniteScrollDirective } from './directives/infinite-scroll.directive';
import { PwaInstallPromptComponent } from './components/pwa-install-prompt/pwa-install-prompt.component';

@NgModule({
  declarations: [
    SkeletonLoaderComponent,
    InfiniteScrollDirective,
    PwaInstallPromptComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SkeletonLoaderComponent,
    InfiniteScrollDirective,
    PwaInstallPromptComponent
  ]
})
export class SharedModule { }
