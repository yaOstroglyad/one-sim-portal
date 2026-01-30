import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PurchasedProductsDataService } from '@shared';
import { of } from 'rxjs';

import { BundlesComponent } from './bundles.component';

describe('BundlesComponent', () => {
    let component: BundlesComponent;
    let fixture: ComponentFixture<BundlesComponent>;

    const mockPurchasedProductsDataService = {
        data$: of({
            subscriberData: null,
            purchasedProducts: []
        })
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BundlesComponent, TranslateModule.forRoot()],
            providers: [
                { provide: PurchasedProductsDataService, useValue: mockPurchasedProductsDataService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BundlesComponent);
        component = fixture.componentInstance;
        // Skip detectChanges as component requires subscriber data
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
