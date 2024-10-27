import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgFormComponent } from './pg-form.component';

describe('PgAnexComponent', () => {
  let component: PgFormComponent;
  let fixture: ComponentFixture<PgFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PgFormComponent]
    });
    fixture = TestBed.createComponent(PgFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
