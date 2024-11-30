import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGatewayTableComponent } from './payment-gateway-table.component';

describe('CustomersComponent', () => {
  let component: PaymentGatewayTableComponent;
  let fixture: ComponentFixture<PaymentGatewayTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentGatewayTableComponent]
    });
    fixture = TestBed.createComponent(PaymentGatewayTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
