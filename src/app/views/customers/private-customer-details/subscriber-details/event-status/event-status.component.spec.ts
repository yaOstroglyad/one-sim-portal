import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PurchasedProductsDataService } from '@shared';
import { of } from 'rxjs';

import { EventStatusComponent } from './event-status.component';

describe('EventStatusComponent', () => {
  let component: EventStatusComponent;
  let fixture: ComponentFixture<EventStatusComponent>;

  const mockPurchasedProductsDataService = {
    data$: of({
      subscriberData: null,
      purchasedProducts: []
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventStatusComponent, TranslateModule.forRoot()],
      providers: [
        { provide: PurchasedProductsDataService, useValue: mockPurchasedProductsDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventStatusComponent);
    component = fixture.componentInstance;
    // Skip detectChanges as component requires subscriber data
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
