import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateCustomerDetailsComponent } from './corporate-customer-details.component';

describe('CorporateCutomserDetailsComponent', () => {
  let component: CorporateCustomerDetailsComponent;
  let fixture: ComponentFixture<CorporateCustomerDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CorporateCustomerDetailsComponent]
    });
    fixture = TestBed.createComponent(CorporateCustomerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
