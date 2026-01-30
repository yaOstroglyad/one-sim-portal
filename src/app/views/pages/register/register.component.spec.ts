import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconSetService } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';
import { iconSubset } from '../../../icons/icon-subset';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let iconSetService: IconSetService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RegisterComponent, TranslateModule.forRoot()],
            providers: [IconSetService]
        }).compileComponents();

        iconSetService = TestBed.inject(IconSetService);
        iconSetService.icons = { ...iconSubset };

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
