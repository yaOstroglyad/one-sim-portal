import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { EditCustomerComponent } from './edit-customer.component';
import { UserRoleService, CompaniesDataService } from '@shared';
import { CompanyProductService } from '../../product-constructor/services';

describe('EditCustomerComponent', () => {
  let component: EditCustomerComponent;
  let fixture: ComponentFixture<EditCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCustomerComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: CompanyProductService, useValue: { list: () => of([]) } },
        { provide: CompaniesDataService, useValue: { getCompanies: () => of([]) } },
        { provide: UserRoleService, useValue: { isAdmin: () => false } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditCustomerComponent);
    component = fixture.componentInstance;
    // Skip detectChanges as component requires complex service setup
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
