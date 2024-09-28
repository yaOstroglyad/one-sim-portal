import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgAnexComponent } from './pg-anex.component';

describe('PgAnexComponent', () => {
  let component: PgAnexComponent;
  let fixture: ComponentFixture<PgAnexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PgAnexComponent]
    });
    fixture = TestBed.createComponent(PgAnexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
