import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconSetService } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';
import { iconSubset } from '../../../icons/icon-subset';
import { Page404Component } from './page404.component';

describe('Page404Component', () => {
    let component: Page404Component;
    let fixture: ComponentFixture<Page404Component>;
    let iconSetService: IconSetService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Page404Component, TranslateModule.forRoot()],
            providers: [IconSetService]
        }).compileComponents();

        iconSetService = TestBed.inject(IconSetService);
        iconSetService.icons = { ...iconSubset };

        fixture = TestBed.createComponent(Page404Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
