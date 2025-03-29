import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPaymentGatewayComponent } from './edit-payment-gateway.component';

describe('SetupResourceComponent', () => {
  let component: EditPaymentGatewayComponent;
  let fixture: ComponentFixture<EditPaymentGatewayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditPaymentGatewayComponent]
    });
    fixture = TestBed.createComponent(EditPaymentGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
