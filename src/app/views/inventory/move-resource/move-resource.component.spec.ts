import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveResourceComponent } from './move-resource.component';

describe('SetupResourceComponent', () => {
  let component: MoveResourceComponent;
  let fixture: ComponentFixture<MoveResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoveResourceComponent]
    });
    fixture = TestBed.createComponent(MoveResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
