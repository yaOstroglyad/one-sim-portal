import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconSetService } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';
import { iconSubset } from '../../../icons/icon-subset';
import { Page500Component } from './page500.component';

describe('Page500Component', () => {
    let component: Page500Component;
    let fixture: ComponentFixture<Page500Component>;
    let iconSetService: IconSetService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Page500Component, TranslateModule.forRoot()],
            providers: [IconSetService]
        }).compileComponents();

        iconSetService = TestBed.inject(IconSetService);
        iconSetService.icons = { ...iconSubset };

        fixture = TestBed.createComponent(Page500Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
