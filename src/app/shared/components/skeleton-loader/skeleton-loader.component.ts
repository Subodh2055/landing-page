import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'list' | 'table' | 'chart' | 'generic' = 'card';
  @Input() count: number = 1;
  @Input() height: string = '100px';
  @Input() width: string = '100%';

  get items(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}
