import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnControlComponent } from './column-control.component';

describe('ColumnControlComponent', () => {
  let component: ColumnControlComponent;
  let fixture: ComponentFixture<ColumnControlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ColumnControlComponent]
    });
    fixture = TestBed.createComponent(ColumnControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
