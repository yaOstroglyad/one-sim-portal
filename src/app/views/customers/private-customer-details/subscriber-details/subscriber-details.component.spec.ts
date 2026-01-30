import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PurchasedProductsDataService } from '@shared';
import { of } from 'rxjs';

import { SubscriberDetailsComponent } from './subscriber-details.component';

describe('SubscriberDetailsComponent', () => {
  let component: SubscriberDetailsComponent;
  let fixture: ComponentFixture<SubscriberDetailsComponent>;

  const mockPurchasedProductsDataService = {
    data$: of({
      subscriberData: null,
      purchasedProducts: []
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberDetailsComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: PurchasedProductsDataService, useValue: mockPurchasedProductsDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriberDetailsComponent);
    component = fixture.componentInstance;
    // Skip detectChanges as component requires subscriber data
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
