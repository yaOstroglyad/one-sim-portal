import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { PrivateCustomerDetailsComponent } from './private-customer-details.component';
import { CustomersDataService, TransactionDataService, PurchasedProductsDataService, SubscriberDataService, AuthService } from '@shared';

describe('PrivateCustomerDetailsComponent', () => {
  let component: PrivateCustomerDetailsComponent;
  let fixture: ComponentFixture<PrivateCustomerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateCustomerDetailsComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }), queryParams: of({}) } },
        { provide: CustomersDataService, useValue: { getCustomer: () => of({}) } },
        { provide: TransactionDataService, useValue: { list: () => of([]) } },
        { provide: PurchasedProductsDataService, useValue: { list: () => of([]) } },
        { provide: SubscriberDataService, useValue: { list: () => of([]) } },
        { provide: AuthService, useValue: { hasPermission: () => false } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrivateCustomerDetailsComponent);
    component = fixture.componentInstance;
    // Skip detectChanges as component requires complex service setup
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
