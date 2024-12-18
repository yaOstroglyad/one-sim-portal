import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
	CustomersDataService,
	HeaderConfig,
	TableConfig,
	TableFilterFieldType
} from '../../shared';
import { CustomersTableService } from './customers-table.service';
import { Customer } from '../../shared';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from '../../shared/model/order';
import { ReSendInviteEmailComponent } from './re-send-invite-email/re-send-invite-email.component';
import { Router } from '@angular/router';

@Component({
	selector: 'app-customers',
	templateUrl: './customers.component.html',
	styleUrls: ['./customers.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<Customer[]>;
	public headerConfig: HeaderConfig = {};


	constructor(private cdr: ChangeDetectorRef,
							private tableService: CustomersTableService,
							private customersDataService: CustomersDataService,
							private router: Router,
							private dialog: MatDialog,
							private snackBar: MatSnackBar
	) {
		this.initheaderConfig();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	ngOnInit(): void {
		this.loadCustomers();
	}

	private loadCustomers(): void {
		this.customersDataService.list()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				this.tableService.updateTableData(data);
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = this.tableService.dataList$;
				this.cdr.detectChanges();
			});
	}

	createCustomer(): void {
		const dialogRef = this.dialog.open(EditCustomerComponent, {
			width: '650px',
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.customersDataService.create(result).subscribe(() => {
					this.loadCustomers();
				});
			}
		});
	}

	private initheaderConfig(): void {
		this.headerConfig = {
			value: {type: TableFilterFieldType.Text, placeholder: 'Filter table data'}
		};
	}

	applyFilter(filterValues: any): void {
		this.tableService.applyFilter(filterValues);
		this.dataList$ = this.tableService.dataList$;
	}

	onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	public openSendEmail(item: Order): void {
		const dialogRef = this.dialog.open(ReSendInviteEmailComponent, {
			width: '400px',
			data: item
		});

		dialogRef.afterClosed().pipe(
			takeUntil(this.unsubscribe$),
			switchMap(email => {
				if (email) {
					return this.customersDataService.reSendInviteEmail(item.id, email).pipe(
						tap(() =>
							this.snackBar.open('Mail sent successfully', null, {
								panelClass: 'app-notification-success',
								duration: 2000
							})
						)
					);
				}
			})
		).subscribe();
	}

	openCustomerDetails(customer: Customer): void {
		this.router.navigate([`home/customers/customer-details/${customer.type}/${customer.id}`]);
	}
}
