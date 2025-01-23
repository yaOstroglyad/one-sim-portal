import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubscriberProductComponent } from './add-subscriber-product.component';

describe('SetupResourceComponent', () => {
  let component: AddSubscriberProductComponent;
  let fixture: ComponentFixture<AddSubscriberProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSubscriberProductComponent]
    });
    fixture = TestBed.createComponent(AddSubscriberProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
