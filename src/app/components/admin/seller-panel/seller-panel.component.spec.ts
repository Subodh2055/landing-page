import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerPanelComponent } from './seller-panel.component';

describe('SellerPanelComponent', () => {
  let component: SellerPanelComponent;
  let fixture: ComponentFixture<SellerPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
