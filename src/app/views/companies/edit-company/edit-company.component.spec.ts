import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { EditCompanyComponent } from './edit-company.component';

describe('EditCompanyComponent', () => {
  let component: EditCompanyComponent;
  let fixture: ComponentFixture<EditCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCompanyComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
