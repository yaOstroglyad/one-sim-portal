import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import {
	CustomersDataService,
	TimelineComponent,
	TimelineEvent,
	DataObject,
	TransactionDataService,
	PurchasedProductsDataService,
	SubscriberDataService,
	SimLocations,
	EmptyStateComponent,
	RefundProductComponent,
	Subscriber, ADMIN_PERMISSION, AuthService
} from '../../../shared';
import { forkJoin, Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import {
	combineAndSortEvents,
	mapPurchaseEvents,
	mapTransactionEvents,
	calculateFinancialSummary,
	getSubscriberByName
} from './utils/customer-details.utils';
import { SubscriberDetailsComponent } from './subscriber-details/subscriber-details.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ShowQrCodeDialogComponent } from './show-qr-code-dialog/show-qr-code-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { AddSubscriberProductComponent } from './add-subscriber-product/add-subscriber-product.component';
import { AddSubscriberComponent } from './add-subscriber/add-subscriber.component';
import { SendRegistrationEmailComponent } from './send-registration-email/send-registration-email.component';

@Component({
	selector: 'app-private-customer-details',
	templateUrl: './private-customer-details.component.html',
	styleUrls: ['./private-customer-details.component.scss'],
	imports: [
		CommonModule,
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatCardModule,
		MatListModule,
		MatTabsModule,
		TimelineComponent,
		EmptyStateComponent,
		SubscriberDetailsComponent,
		MatTooltipModule,
		TranslateModule
	],
	standalone: true
})
export class PrivateCustomerDetailsComponent implements OnInit {
	@ViewChild('tabGroup', { static: false, read: ElementRef }) tabGroup: ElementRef;

	customerDetailsView$: Observable<DataObject>;
	timelineEvents: TimelineEvent[] = [];
	totalSpent: number = 0;
	totalUsedGB: number = 0;
	currency: string = 'USD';
	simLocations: SimLocations[];

	route = inject(ActivatedRoute);
	customerDataService = inject(CustomersDataService);
	transactionDataService = inject(TransactionDataService);
	purchasedProductsDataService = inject(PurchasedProductsDataService);
	subscriberDataService = inject(SubscriberDataService);
	renderer = inject(Renderer2);
	dialog = inject(MatDialog);
	cdr = inject(ChangeDetectorRef);
	authService = inject(AuthService);
	isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
	customerId: string;
	subscribers: Subscriber[];
	selectedSubscriber: Subscriber;

	ngOnInit(): void {
		this.customerId = this.route.snapshot.paramMap.get('id') || '';
		this.loadCustomerDetails();

		this.loadTimelineEvents();
	}

	private loadTimelineEvents(): void {
		this.customerDetailsView$
			.pipe(
				switchMap((customerDetails: DataObject) => {
					const subscriberId = customerDetails?.subscribers[0]?.id;
					this.subscribers = customerDetails.subscribers;

					if (!subscriberId) {
						return of([]);
					}

					this.loadSimLocation(customerDetails.subscribers[0].simId);

					return forkJoin({
						transactions: this.transactionDataService.getTransactions(this.customerId),
						purchasedProducts: this.purchasedProductsDataService.getPurchasedProducts({subscriberId})
					}).pipe(
						map(({transactions, purchasedProducts}) => {
							const financialSummary = calculateFinancialSummary(purchasedProducts);
							this.totalSpent = financialSummary.totalSpent;
							this.totalUsedGB = financialSummary.totalUsedGB;
							this.currency = financialSummary.currency;

							const transactionEvents = mapTransactionEvents(transactions);
							const purchaseEvents = mapPurchaseEvents(purchasedProducts);
							return combineAndSortEvents(transactionEvents, purchaseEvents);
						})
					);
				})
			)
			.subscribe(events => {
				this.timelineEvents = events;
				this.cdr.detectChanges();
			});
	}

	private loadCustomerDetails(): void {
		this.customerDetailsView$ = this.customerDataService.getCustomerDetails(this.customerId);
	}

	private loadSimLocation(simId: string): void {
		if (!simId) {
			return;
		}

		this.subscriberDataService.getSimLocations(simId).subscribe({
			next: (locations: SimLocations[]) => {
				this.simLocations = locations;
			},
			error: () => {
				this.simLocations = [];
			}
		});
	}

	trackBySubscriber(index: number, item: any): string {
		return item.id;
	}

	onTabChange(event: MatTabChangeEvent): void {
		this.selectedSubscriber = getSubscriberByName(this.subscribers, event.tab.textLabel);
	}

	openRefund(subscriber: Subscriber): void {
		const data = {id: subscriber.simId};
		const dialogRef = this.dialog.open(RefundProductComponent, {
			width: '600px',
			data
		});

		dialogRef.afterClosed().subscribe(() => this.loadCustomerDetails());
	}

	public openShowQRCode(subscriber: Subscriber): void {
		this.subscriberDataService.getSimDetails({ id: subscriber.simId }).subscribe(sim => {
			const dialogRef = this.dialog.open(ShowQrCodeDialogComponent, {
				width: '350px',
				data: sim.qrCode
			});

			dialogRef.afterClosed().subscribe();
		})
	}

	public highlightTab(): void {
		if (this.tabGroup) {
			this.renderer.addClass(this.tabGroup.nativeElement, 'custom-highlight');
		} else {
			console.error('tabGroup is not defined');
		}
	}

	public removeHighlightTab(): void {
		if (this.tabGroup) {
			this.renderer.removeClass(this.tabGroup.nativeElement, 'custom-highlight');
		} else {
			console.error('tabGroup is not defined');
		}
	}

	public addProduct(subscriber: Subscriber) {
		const data = {id: subscriber.id};
		const dialogRef = this.dialog.open(AddSubscriberProductComponent, {
			width: '600px',
			data
		});

		dialogRef.afterClosed().subscribe(() => this.loadCustomerDetails());
	}

	public addSubscriber() {
		const data = {customerId: this.customerId};
		const dialogRef = this.dialog.open(AddSubscriberComponent, {
			width: '600px',
			data
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.loadCustomerDetails();
			}
		});
	}

	public sendRegistrationEmail(subscriber: Subscriber): void {
		const data = { id: subscriber.id };
		const dialogRef = this.dialog.open(SendRegistrationEmailComponent, {
			width: '400px',
			data
		});

		dialogRef.afterClosed().subscribe(() => this.loadCustomerDetails());
	}
}
