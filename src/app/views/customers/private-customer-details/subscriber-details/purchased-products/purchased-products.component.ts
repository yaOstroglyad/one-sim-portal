import { Component, inject, Input, OnInit } from '@angular/core';
import {
	ProductPurchase,
	Subscriber,
	PurchasedProductsDataService,
	EmptyStateComponent,
	convertUsage
} from '@shared';
import { MatTableModule } from '@angular/material/table';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Component({
	standalone: true,
	selector: 'app-purchased-products',
	templateUrl: './purchased-products.component.html',
	imports: [
    MatTableModule,
    DatePipe,
    NgClass,
    AsyncPipe,
    EmptyStateComponent,
    TranslateModule
],
	styleUrls: ['./purchased-products.component.scss']
})
export class PurchasedProductsComponent implements OnInit {
	purchasedProductsView$: Observable<ProductPurchase[]>;
	purchasedProductsDataService = inject(PurchasedProductsDataService);
	@Input() subscriber!: Subscriber;
	displayedColumns: string[] = [
		'productName',
		'status',
		'price',
		'totalBalance',
		'remainingBalance',
		'purchasedAt',
		'usageStartedAt',
		'usageExpiredAt',
		'updatedAt',
		'updatedBy'
	];

	ngOnInit(): void {
		this.purchasedProductsView$ = this.purchasedProductsDataService.getPurchasedProducts({subscriberId: this.subscriber.id}).pipe(
			map((activeProducts: ProductPurchase[]) =>
				activeProducts.map(product => ({
					...product,
					usage: {
						...product.usage,
						balance: product.usage.balance.map(balance => convertUsage(balance))
					}
				}))
			)
		);
	}

	getStatusClass(status: string): string {
		switch (status.toLowerCase()) {
			case 'active':
				return 'status-active';
			case 'expired':
				return 'status-expired';
			default:
				return '';
		}
	}

	public getUnitType(usage: any): string {
		return usage.balance[0].unitType === 'Gigabyte' ? 'GB' : usage.balance[0].unitType;
	}
}
