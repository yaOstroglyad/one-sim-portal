import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedProductsComponent } from './purchased-products.component';

describe('SimActiveProductsComponent', () => {
  let component: PurchasedProductsComponent;
  let fixture: ComponentFixture<PurchasedProductsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchasedProductsComponent]
    });
    fixture = TestBed.createComponent(PurchasedProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
