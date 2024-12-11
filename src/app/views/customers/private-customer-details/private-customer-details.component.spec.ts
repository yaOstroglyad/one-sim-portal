import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateCustomerDetailsComponent } from './private-customer-details.component';

describe('PrivateCustomerDetailsComponent', () => {
  let component: PrivateCustomerDetailsComponent;
  let fixture: ComponentFixture<PrivateCustomerDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrivateCustomerDetailsComponent]
    });
    fixture = TestBed.createComponent(PrivateCustomerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
