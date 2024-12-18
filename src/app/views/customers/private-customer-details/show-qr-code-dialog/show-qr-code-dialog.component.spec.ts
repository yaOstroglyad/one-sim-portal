import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowQrCodeDialogComponent } from './show-qr-code-dialog.component';

describe('ShowQrCodeDialogComponent', () => {
  let component: ShowQrCodeDialogComponent;
  let fixture: ComponentFixture<ShowQrCodeDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowQrCodeDialogComponent]
    });
    fixture = TestBed.createComponent(ShowQrCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
