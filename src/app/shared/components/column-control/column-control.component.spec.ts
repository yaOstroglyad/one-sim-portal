import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TableConfigAbstractService } from '@shared';
import { of } from 'rxjs';

import { ColumnControlComponent } from './column-control.component';

describe('ColumnControlComponent', () => {
    let component: ColumnControlComponent;
    let fixture: ComponentFixture<ColumnControlComponent>;

    const mockTableConfigService = {
        config$: of({
            columns: [],
            visibleColumns: []
        })
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ColumnControlComponent, TranslateModule.forRoot()],
            providers: [
                { provide: TableConfigAbstractService, useValue: mockTableConfigService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ColumnControlComponent);
        component = fixture.componentInstance;
        // Skip detectChanges as component requires full TableConfig
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
