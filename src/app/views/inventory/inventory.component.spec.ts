import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { InventoryComponent } from './inventory.component';
import { AuthService } from '@shared';
import { InventoryDataService } from './inventory-data.service';
import { InventoryTableService } from './inventory-table.service';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: { hasPermission: () => false } },
        { provide: InventoryDataService, useValue: { list: () => of([]) } },
        { provide: InventoryTableService, useValue: { getTableConfig: () => of({}), updateTableData: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
