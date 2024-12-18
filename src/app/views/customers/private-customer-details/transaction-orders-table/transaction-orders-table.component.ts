import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import {
	Subscriber,
	TransactionOrder,
	TransactionDataService,
	Customer,
	EmptyStateComponent
} from '../../../../shared';
import { MatTableModule } from '@angular/material/table';
import { AsyncPipe, DatePipe, JsonPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-transaction-orders-table',
	templateUrl: './transaction-orders-table.component.html',
	styleUrls: ['./transaction-orders-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		MatTableModule,
		JsonPipe,
		DatePipe,
		AsyncPipe,
		NgIf,
		EmptyStateComponent
	],
	standalone: true
})
export class TransactionOrdersTableComponent implements OnInit {
	transactionsView$: Observable<TransactionOrder[]>;
	transactionDataService = inject(TransactionDataService);
	@Input() subscriber: Subscriber;
	@Input() customer: Partial<Customer>;

	displayedColumns: string[] = [
		'type',
		'status',
		'productName',
		'productPrice',
		'createdAt',
		'createdBy',
		'updatedAt',
		'updatedBy',
		'externalTransactionId',
		'triggerType'
	];

	ngOnInit(): void {
		this.transactionsView$ = this.transactionDataService.getTransactions(this.customer.id, this.subscriber.id);
	}
}
