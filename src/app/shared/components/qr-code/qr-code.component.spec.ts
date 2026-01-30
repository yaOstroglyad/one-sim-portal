import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { QrCodeComponent } from './qr-code.component';

describe('QrCodeComponent', () => {
    let component: QrCodeComponent;
    let fixture: ComponentFixture<QrCodeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [QrCodeComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(QrCodeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
