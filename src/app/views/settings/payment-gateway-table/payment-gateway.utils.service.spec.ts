import { TestBed } from '@angular/core/testing';

import { PaymentGatewayUtilsService } from './payment-gateway.utils.service';

describe('PaymentGatewayUtilsService', () => {
  let service: PaymentGatewayUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentGatewayUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
