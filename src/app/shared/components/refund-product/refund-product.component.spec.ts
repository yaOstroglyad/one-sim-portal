import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { RefundProductComponent } from './refund-product.component';
import { RefundProductService } from './refund-product.service';
import { NotificationService } from '@shared/services/ui/notification.service';

describe('RefundProductComponent', () => {
    let component: RefundProductComponent;
    let fixture: ComponentFixture<RefundProductComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RefundProductComponent, TranslateModule.forRoot()],
            providers: [
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: { id: 'test-id' } },
                { provide: RefundProductService, useValue: { list: () => of([]) } },
                { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RefundProductComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
