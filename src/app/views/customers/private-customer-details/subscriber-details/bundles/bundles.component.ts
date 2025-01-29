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
import { convertUsage } from '../../../../../shared/utils/utils';

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
						product.usage.balance.map(balance => this.convertUsageWithProductName(balance, product))
					)
				)
			);
	}

	convertUsageWithProductName(balance: Balance, product: ProductPurchase): ExtendedUsageInfo {
		return {
			productName: product.productName,
			...convertUsage(balance)
		};
	}
}
