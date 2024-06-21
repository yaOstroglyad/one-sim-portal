import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupResourceComponent } from './setup-resource.component';

describe('SetupResourceComponent', () => {
  let component: SetupResourceComponent;
  let fixture: ComponentFixture<SetupResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetupResourceComponent]
    });
    fixture = TestBed.createComponent(SetupResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
