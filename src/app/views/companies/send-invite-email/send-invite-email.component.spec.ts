import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SendInviteEmailComponent } from './send-invite-email.component';

describe('SendInviteEmailComponent', () => {
  let component: SendInviteEmailComponent;
  let fixture: ComponentFixture<SendInviteEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendInviteEmailComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SendInviteEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
