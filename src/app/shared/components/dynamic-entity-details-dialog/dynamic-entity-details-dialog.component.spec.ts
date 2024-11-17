import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicEntityDetailsDialogComponent } from './dynamic-entity-details-dialog.component';

describe('DynamicEntityDetailsDialogComponent', () => {
  let component: DynamicEntityDetailsDialogComponent;
  let fixture: ComponentFixture<DynamicEntityDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicEntityDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(DynamicEntityDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
