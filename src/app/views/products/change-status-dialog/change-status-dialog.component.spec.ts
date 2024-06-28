import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeStatusDialogComponent } from './change-status-dialog.component';

describe('ChangeStatusDialogComponent', () => {
  let component: ChangeStatusDialogComponent;
  let fixture: ComponentFixture<ChangeStatusDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeStatusDialogComponent]
    });
    fixture = TestBed.createComponent(ChangeStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
