import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { RefundProductComponent } from './refund-product.component';
import { RefundProductService } from './refund-product.service';
import { NotificationService } from '@shared/services/ui/notification.service';

describe('RefundProductComponent', () => {
  let component: RefundProductComponent;
  let fixture: ComponentFixture<RefundProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundProductComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 'test-id' } },
        { provide: RefundProductService, useValue: { list: () => of([]) } },
        { provide: NotificationService, useValue: { success: jest.fn(), error: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RefundProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
