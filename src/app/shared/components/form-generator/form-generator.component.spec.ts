import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FormGeneratorComponent } from './form-generator.component';

describe('FormGeneratorComponent', () => {
    let component: FormGeneratorComponent;
    let fixture: ComponentFixture<FormGeneratorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormGeneratorComponent, TranslateModule.forRoot(), NoopAnimationsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(FormGeneratorComponent);
        component = fixture.componentInstance;
        component.config = { fields: [] };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
