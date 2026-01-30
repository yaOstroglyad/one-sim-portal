import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteConfirmationComponent } from './delete-confirmation.component';
import { configureTestBed } from '@shared/utils/testing';

describe('DeleteConfirmationComponent', () => {
    let component: DeleteConfirmationComponent;
    let fixture: ComponentFixture<DeleteConfirmationComponent>;

    beforeEach(async () => {
        await configureTestBed({
            imports: [DeleteConfirmationComponent]
        });

        fixture = TestBed.createComponent(DeleteConfirmationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
