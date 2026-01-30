import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IconSetService } from '@coreui/icons-angular';
import { of } from 'rxjs';

import { CompaniesComponent } from './companies.component';
import { CompaniesDataService } from '@shared';
import { NotificationService } from '@shared/services/ui/notification.service';
import { iconSubset } from '../../icons/icon-subset';

describe('CompaniesComponent', () => {
    let component: CompaniesComponent;
    let fixture: ComponentFixture<CompaniesComponent>;
    let iconSetService: IconSetService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CompaniesComponent, TranslateModule.forRoot(), NoopAnimationsModule],
            providers: [
                IconSetService,
                { provide: CompaniesDataService, useValue: { paginatedCompanies: () => of({ content: [], totalPages: 0 }) } },
                { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } }
            ]
        }).compileComponents();

        iconSetService = TestBed.inject(IconSetService);
        iconSetService.icons = { ...iconSubset };

        fixture = TestBed.createComponent(CompaniesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
