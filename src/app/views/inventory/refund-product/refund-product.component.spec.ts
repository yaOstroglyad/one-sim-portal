import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundProductComponent } from './refund-product.component';

describe('SetupResourceComponent', () => {
  let component: RefundProductComponent;
  let fixture: ComponentFixture<RefundProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RefundProductComponent]
    });
    fixture = TestBed.createComponent(RefundProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
