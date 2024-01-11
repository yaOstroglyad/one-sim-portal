import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableInitializationErrorComponent } from './table-initialization-error.component';

describe('TableInitializationErrorComponent', () => {
  let component: TableInitializationErrorComponent;
  let fixture: ComponentFixture<TableInitializationErrorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableInitializationErrorComponent]
    });
    fixture = TestBed.createComponent(TableInitializationErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
