import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit
} from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {
	HeaderConfig,
	TableConfig,
	TableFilterFieldType,
	OrdersDataService, ADMIN_PERMISSION, AuthService
} from '../../shared';
import { OrdersTableService } from './orders-table.service';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { Order } from '../../shared/model/order';
import { MatDialog } from '@angular/material/dialog';
import { EditOrderDescriptionComponent } from './edit-order-description/edit-order-description.component';
import { RevertOrderComponent } from './revert-order/revert-order.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-orders',
	templateUrl: './orders.component.html',
	styleUrls: ['./orders.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<Order[]>;
	public headerConfig: HeaderConfig = {};
	public isAdmin: boolean;

	constructor(private cdr: ChangeDetectorRef,
							private tableService: OrdersTableService,
							private ordersDataService: OrdersDataService,
							private translate: TranslateService,
							private authService: AuthService,
							private dialog: MatDialog
	) {
		this.initheaderConfig();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	ngOnInit(): void {
		this.loadOrders();
		this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
	}

	private loadOrders(): void {
		this.ordersDataService.list()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = of(data);
				this.cdr.detectChanges();
			});
	}

	private initheaderConfig(): void {
		this.headerConfig = {
			value: {type: TableFilterFieldType.Text, placeholder: this.translate.instant('common.table.filterPlaceholder')}
		};
	}

	applyFilter(filterValues: any): void {
		this.tableService.applyFilter(filterValues);
		this.dataList$ = this.tableService.dataList$;
	}

	onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	public openEditDescriptionDialog(item: Order): void {
		const dialogRef = this.dialog.open(EditOrderDescriptionComponent, {
			width: '400px',
			data: item
		});

		dialogRef.afterClosed().pipe(
			takeUntil(this.unsubscribe$),
			switchMap(newDescription => {
				if (this.isDescriptionChanged(newDescription, item.description)) {
					return this.ordersDataService.updateDescription({id: item.id, description: newDescription}).pipe(
						tap(() => this.loadOrders())
					);
				}
				return of(null);
			})
		).subscribe();
	}

	public openRevertOrderDialog(item: Order): void {
		const dialogRef = this.dialog.open(RevertOrderComponent, {
			width: '500px',
			data: item
		});

		dialogRef.afterClosed().pipe(
			takeUntil(this.unsubscribe$),
			switchMap(result => {
				if (result) {
					// Revert order was successful, reload orders
					return this.ordersDataService.list().pipe(
						tap(data => {
							this.tableConfig$ = this.tableService.getTableConfig();
							this.dataList$ = of(data);
							this.cdr.detectChanges();
						})
					);
				}
				return of(null);
			})
		).subscribe();
	}

	private isDescriptionChanged(newDescription: string, description: string): boolean {
		if (newDescription) {
			return newDescription !== description;
		} else {
			return false;
		}
	}
}
