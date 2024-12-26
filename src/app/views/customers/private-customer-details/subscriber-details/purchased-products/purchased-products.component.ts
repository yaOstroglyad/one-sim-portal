import { Component, inject, Input, OnInit } from '@angular/core';
import { ProductPurchase, Subscriber, PurchasedProductsDataService, EmptyStateComponent } from '../../../../../shared';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-purchased-products',
	templateUrl: './purchased-products.component.html',
	standalone: true,
	imports: [
		MatTableModule,
		RouterLink,
		DatePipe,
		CurrencyPipe,
		NgClass,
		AsyncPipe,
		NgIf,
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
		this.purchasedProductsView$ = this.purchasedProductsDataService.getPurchasedProducts({subscriberId: this.subscriber.id});
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

	public convertData(usage: any, key: string): number {
		const conversionFactor = usage.balance[0].unitType === 'Gigabyte' as any ? 1024 * 1024 * 1024 : 1;
		return Math.round((usage.balance[0]?.[key] || 0) / conversionFactor * 100) / 100;
	}

	public getUnitType(usage: any): string {
		return usage.balance[0].unitType === 'Gigabyte' ? 'GB' : usage.balance[0].unitType;
 	}
}
