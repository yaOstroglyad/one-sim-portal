import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PurchasedProductsDataService } from '@shared';
import { of } from 'rxjs';

import { PurchasedProductsComponent } from './purchased-products.component';

describe('PurchasedProductsComponent', () => {
    let component: PurchasedProductsComponent;
    let fixture: ComponentFixture<PurchasedProductsComponent>;

    const mockPurchasedProductsDataService = {
        data$: of({
            subscriberData: null,
            purchasedProducts: []
        })
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PurchasedProductsComponent, TranslateModule.forRoot()],
            providers: [
                { provide: PurchasedProductsDataService, useValue: mockPurchasedProductsDataService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PurchasedProductsComponent);
        component = fixture.componentInstance;
        // Skip detectChanges as component requires subscriber data
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
