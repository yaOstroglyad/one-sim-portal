import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { Customer, CustomersDataService, CustomerType, TableConfig } from '../../shared';
import { CustomersTableService } from './customers-table.service';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from '../../shared/model/order';
import { ReSendInviteEmailComponent } from './re-send-invite-email/re-send-invite-email.component';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-customers',
	templateUrl: './customers.component.html',
	styleUrls: ['./customers.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit, OnDestroy {
	protected readonly CustomerType = CustomerType;
	private unsubscribe$ = new Subject<void>();
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<Customer[]>;
	public filterForm: FormGroup;

	constructor(
		private cdr: ChangeDetectorRef,
		private tableService: CustomersTableService,
		private customersDataService: CustomersDataService,
		private router: Router,
		private dialog: MatDialog,
		private snackBar: MatSnackBar
	) {
	}

	public ngOnInit(): void {
		this.initFormControls();
		this.loadData();
		this.setupFilters();
	}

	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public onPageChange({page, size}: { page: number; size: number }): void {
		this.loadData({
			page,
			size,
			...this.filterForm.getRawValue()
		});
	}

	public applyFilter(): void {
		const params = {
			page: 0,
			size: 10,
			...this.filterForm.getRawValue()
		};
		this.loadData(params);
	}

	public onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	public createCustomer(): void {
		const dialogRef = this.dialog.open(EditCustomerComponent, {
			width: '650px',
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.customersDataService.create(result).subscribe(() => {
					this.loadData();
				});
			}
		});
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

	public openCustomerDetails(customer: Customer): void {
		if (customer.type.toUpperCase() === CustomerType.Private.toUpperCase()) {
			this.router.navigate([`home/customers/customer-details/${customer.type}/${customer.id}`]);
		}
	}

	public resetForm(): void {
		this.filterForm.reset();
	}

	private initFormControls(): void {
		this.filterForm = new FormGroup({
			iccid: new FormControl(null),
			name: new FormControl(null),
			externalId: new FormControl(null),
			externalTransactionId: new FormControl(null),
			type: new FormControl(null)
		});
	}

	private setupFilters(): void {
		this.filterForm.valueChanges.pipe(
			debounceTime(700),
			takeUntil(this.unsubscribe$)
		).subscribe(() => {
			this.applyFilter();
		});
	}

	private loadData(params: {
		page: number;
		size: number;
		iccid?: string;
		name?: string;
		externalId?: string;
		externalTransactionId?: string;
		type?: string
	} = {page: 0, size: 10}): void {
		this.customersDataService.paginatedCustomers(params, params.page, params.size)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				this.tableService.updateConfigData(data?.totalPages || 20);
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = of(data.content);
				this.cdr.detectChanges();
				if (this.filterForm.dirty) {
					this.snackBar.open(`Search results loaded successfully. Total elements: ${data.totalElements}`, null, {
						panelClass: 'app-notification-success',
						duration: 1000
					});
				}
			});
	}
}
