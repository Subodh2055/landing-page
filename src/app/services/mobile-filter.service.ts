import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileFilterService {
  private filterToggleSubject = new Subject<void>();
  public filterToggle$ = this.filterToggleSubject.asObservable();

  toggleMobileFilter(): void {
    this.filterToggleSubject.next();
  }
}
