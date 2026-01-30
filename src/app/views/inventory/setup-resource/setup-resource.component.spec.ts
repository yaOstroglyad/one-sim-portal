import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { SetupResourceComponent } from './setup-resource.component';
import { ProvidersDataService } from '@shared';

describe('SetupResourceComponent', () => {
    let component: SetupResourceComponent;
    let fixture: ComponentFixture<SetupResourceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SetupResourceComponent, TranslateModule.forRoot(), NoopAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: ProvidersDataService, useValue: { list: () => of([]) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SetupResourceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
