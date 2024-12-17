import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionOrdersTableComponent } from './transaction-orders-table.component';

describe('TransactionTableComponent', () => {
  let component: TransactionOrdersTableComponent;
  let fixture: ComponentFixture<TransactionOrdersTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionOrdersTableComponent]
    });
    fixture = TestBed.createComponent(TransactionOrdersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
