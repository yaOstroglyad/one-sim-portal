import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AddSubscriberProductComponent } from './add-subscriber-product.component';
import { AddSubscriberProductService } from './add-subscriber-product.service';
import { NotificationService } from '@shared/services/ui/notification.service';

describe('AddSubscriberProductComponent', () => {
  let component: AddSubscriberProductComponent;
  let fixture: ComponentFixture<AddSubscriberProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSubscriberProductComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 'test-id' } },
        { provide: AddSubscriberProductService, useValue: { list: () => of([]) } },
        { provide: NotificationService, useValue: { success: jest.fn(), error: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddSubscriberProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
