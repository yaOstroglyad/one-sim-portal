import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrderDescriptionComponent } from './edit-order-description.component';

describe('SetupResourceComponent', () => {
  let component: EditOrderDescriptionComponent;
  let fixture: ComponentFixture<EditOrderDescriptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditOrderDescriptionComponent]
    });
    fixture = TestBed.createComponent(EditOrderDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
