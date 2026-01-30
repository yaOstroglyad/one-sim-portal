import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { EditPaymentGatewayComponent } from './edit-payment-gateway.component';
import { PaymentGatewayService } from '../payment-gateway.service';
import { PaymentGatewayUtilsService } from '../payment-gateway.utils.service';
import { NotificationService } from '@shared/services/ui/notification.service';

describe('EditPaymentGatewayComponent', () => {
  let component: EditPaymentGatewayComponent;
  let fixture: ComponentFixture<EditPaymentGatewayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPaymentGatewayComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: PaymentGatewayService, useValue: { update: () => of({}) } },
        { provide: PaymentGatewayUtilsService, useValue: { getFormConfig: () => ({ fields: [] }) } },
        { provide: NotificationService, useValue: { success: jest.fn(), error: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPaymentGatewayComponent);
    component = fixture.componentInstance;
    // Skip detectChanges as component requires complex service setup
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
