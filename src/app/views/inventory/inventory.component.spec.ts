import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, BehaviorSubject } from 'rxjs';

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
                { provide: InventoryDataService, useValue: { list: () => of({ content: [], totalPages: 0, totalElements: 0 }) } },
                { provide: InventoryTableService, useValue: {
                    getTableConfig: () => new BehaviorSubject({ columns: [], pagination: { enabled: false } }),
                    updateTableData: vi.fn(),
                    updateConfigData: vi.fn(),
                    updateColumnVisibility: vi.fn()
                } }
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
