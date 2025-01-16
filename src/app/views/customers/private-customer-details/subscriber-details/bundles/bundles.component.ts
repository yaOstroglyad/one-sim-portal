import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import {
	ProductPurchase,
	Subscriber,
	PurchasedProductsDataService,
	UsageInfo,
	ChartComponent, Balance, EmptyStateComponent
} from '../../../../../shared';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

interface ExtendedUsageInfo extends UsageInfo {
	productName: string;
}

@Component({
	selector: 'app-bundles',
	templateUrl: './bundles.component.html',
	styleUrls: ['./bundles.component.scss'],
	standalone: true,
	imports: [
		ChartComponent,
		MatCardModule,
		NgForOf,
		NgIf,
		AsyncPipe,
		EmptyStateComponent,
		MatButtonModule,
		NgClass,
		TranslateModule
	]
})
export class BundlesComponent implements OnInit {
	bundlesView$: Observable<ExtendedUsageInfo[]>;
	purchasedProductsDataService = inject(PurchasedProductsDataService);
	@Input() subscriber!: Subscriber;

	@ViewChild('scrollContainer', {static: false}) scrollContainer: ElementRef;

	scrollLeft(): void {
		this.scrollContainer.nativeElement.scrollBy({left: -240, behavior: 'smooth'});
	}

	scrollRight(): void {
		this.scrollContainer.nativeElement.scrollBy({left: 240, behavior: 'smooth'});
	}

	ngOnInit(): void {
		this.bundlesView$ = this.purchasedProductsDataService
			.getPurchasedProducts({subscriberId: this.subscriber.id})
			.pipe(
				map((products: ProductPurchase[]) =>
					products.filter(product => product.status === 'active' || product.status === 'paid')
				),
				map((activeProducts: ProductPurchase[]) => activeProducts.flatMap(product =>
						product.usage.balance.map(balance => this.mapBalanceToUsageInfo(balance, product))
					)


				)
			);
	}

	private mapBalanceToUsageInfo(balance: Balance, product: ProductPurchase): ExtendedUsageInfo {
		const conversionFactor = balance.unitType === 'Gigabyte' as any ? 1024 * 1024 * 1024 : 1;
		return {
			productName: product.productName,
			type: balance.type,
			total: Math.round(balance.total / conversionFactor * 100) / 100,
			used: Math.round(balance.used / conversionFactor * 100) / 100,
			remaining: Math.round(balance.remaining / conversionFactor * 100) / 100,
			unitType: balance.unitType === 'Gigabyte' as any ? 'GB' : balance.unitType
		};
	}
}
