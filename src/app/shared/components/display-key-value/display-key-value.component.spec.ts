import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayKeyValueComponent } from './display-key-value.component';

describe('DisplayKeyValueComponent', () => {
  let component: DisplayKeyValueComponent;
  let fixture: ComponentFixture<DisplayKeyValueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayKeyValueComponent]
    });
    fixture = TestBed.createComponent(DisplayKeyValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
