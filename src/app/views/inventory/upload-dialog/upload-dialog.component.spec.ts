import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { IconSetService } from '@coreui/icons-angular';
import { of } from 'rxjs';

import { UploadDialogComponent } from './upload-dialog.component';
import { UploadResourceService } from './upload-resource.service';
import { iconSubset } from '../../../icons/icon-subset';

describe('UploadDialogComponent', () => {
    let component: UploadDialogComponent;
    let fixture: ComponentFixture<UploadDialogComponent>;
    let iconSetService: IconSetService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UploadDialogComponent, TranslateModule.forRoot()],
            providers: [
                IconSetService,
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: UploadResourceService, useValue: { upload: () => of({}) } }
            ]
        }).compileComponents();

        iconSetService = TestBed.inject(IconSetService);
        iconSetService.icons = { ...iconSubset };

        fixture = TestBed.createComponent(UploadDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
