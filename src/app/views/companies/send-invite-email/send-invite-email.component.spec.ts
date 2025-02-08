import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendInviteEmailComponent } from './send-invite-email.component';

describe('SetupResourceComponent', () => {
  let component: SendInviteEmailComponent;
  let fixture: ComponentFixture<SendInviteEmailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendInviteEmailComponent]
    });
    fixture = TestBed.createComponent(SendInviteEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
