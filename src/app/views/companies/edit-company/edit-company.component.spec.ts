import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCompanyComponent } from './edit-company.component';

describe('EditCustomerComponent', () => {
  let component: EditCompanyComponent;
  let fixture: ComponentFixture<EditCompanyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditCompanyComponent]
    });
    fixture = TestBed.createComponent(EditCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
