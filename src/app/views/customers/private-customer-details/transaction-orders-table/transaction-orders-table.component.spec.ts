import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionDataService } from '@shared';
import { of } from 'rxjs';

import { TransactionOrdersTableComponent } from './transaction-orders-table.component';

describe('TransactionOrdersTableComponent', () => {
    let component: TransactionOrdersTableComponent;
    let fixture: ComponentFixture<TransactionOrdersTableComponent>;

    const mockTransactionDataService = {
        getTransactions: vi.fn().mockReturnValue(of([]))
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TransactionOrdersTableComponent, TranslateModule.forRoot()],
            providers: [
                { provide: TransactionDataService, useValue: mockTransactionDataService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionOrdersTableComponent);
        component = fixture.componentInstance;
        // Skip detectChanges as component requires subscriber and customer inputs
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
