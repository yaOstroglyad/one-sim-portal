import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReSendInviteEmailComponent } from './re-send-invite-email.component';

describe('SetupResourceComponent', () => {
  let component: ReSendInviteEmailComponent;
  let fixture: ComponentFixture<ReSendInviteEmailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReSendInviteEmailComponent]
    });
    fixture = TestBed.createComponent(ReSendInviteEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
