import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { ShowQrCodeDialogComponent } from './show-qr-code-dialog.component';

describe('ShowQrCodeDialogComponent', () => {
    let component: ShowQrCodeDialogComponent;
    let fixture: ComponentFixture<ShowQrCodeDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ShowQrCodeDialogComponent, TranslateModule.forRoot()],
            providers: [
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: { qrCode: 'test', iccid: '123' } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShowQrCodeDialogComponent);
        component = fixture.componentInstance;
        // Skip detectChanges - angularx-qrcode requires Canvas API not available in jsdom
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
