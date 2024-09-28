import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgPaypalComponent } from './pg-paypal.component';

describe('PgPaypalComponent', () => {
  let component: PgPaypalComponent;
  let fixture: ComponentFixture<PgPaypalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PgPaypalComponent]
    });
    fixture = TestBed.createComponent(PgPaypalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
