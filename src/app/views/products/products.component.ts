import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Package, StatusEnum } from '../../shared/model/package';
import { Observable, Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { HeaderConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { ProductsTableService } from './products-table.service';
import { ProductsDataService } from './products-data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditProductComponent } from './edit-product/edit-product.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { ChangeStatusDialogComponent } from './change-status-dialog/change-status-dialog.component';

@Component({
	selector: 'app-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit, OnDestroy {
	@ViewChild('usageTemplate') usageTemplate: TemplateRef<any>;
	@ViewChild('customersTemplate') customersTemplate: TemplateRef<any>;
	@ViewChild('validityTemplate') validityTemplate: TemplateRef<any>;
	@ViewChild('statusTemplate') statusTemplate: TemplateRef<any>;

	public visible = false;
	public tableConfig$: Observable<TableConfig>;
	public dataList$: Observable<Package[]>;
	public headerConfig: HeaderConfig;
	public validStatuses = Object.values(StatusEnum);
	private unsubscribe$ = new Subject<void>();

	constructor(
		private tableService: ProductsTableService,
		private productsDataService: ProductsDataService,
		private dialog: MatDialog
	) {
		this.headerConfig = {
			value: { type: TableFilterFieldType.Text, placeholder: 'Filter table data' }
		};
		this.tableConfig$ = this.tableService.tableConfigSubject.asObservable();
	}

	ngOnInit(): void {
		this.loadProducts();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public applyFilter(filterValues: any): void {
		this.tableService.applyFilter(filterValues);
		this.dataList$ = this.tableService.dataList$;
	}

	public onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	public create(): void {
		this.openDialog(CreateProductComponent)
			.pipe(
				takeUntil(this.unsubscribe$),
				switchMap(result => {
					if (this.isChanged(result, null)) {
						return this.productsDataService.create(result).pipe(
							tap(() => this.loadProducts())
						);
					}
					return of(null);
				})
			).subscribe();
	}

	public edit(product?: Package): void {
		this.openDialog(EditProductComponent, product)
			.pipe(
				takeUntil(this.unsubscribe$),
				switchMap(result => {
					if (this.isChanged(result, product)) {
						return this.productsDataService.update(result).pipe(
							tap(() => this.loadProducts())
						);
					}
					return of(null);
				})
			).subscribe();
	}

	public openChangeStatus(product: Package): void {
		const dialogRef = this.dialog.open(ChangeStatusDialogComponent, {
			width: '250px',
			data: { currentStatus: product.status }
		});

		dialogRef.afterClosed().pipe(
			takeUntil(this.unsubscribe$),
			switchMap(newStatus => {
				if (this.isChanged(newStatus, product.status)) {
					return this.productsDataService.updateStatus({ id: product.id, status: newStatus }).pipe(
						tap(() => this.loadProducts())
					);
				}
				return of(null);
			})
		).subscribe();
	}

	private loadProducts(): void {
		this.productsDataService.list().pipe(
			takeUntil(this.unsubscribe$),
			tap(data => {
				this.tableService.updateTableData(data);
				this.tableService.addCustomColumns(this);
				this.tableService.tableConfigSubject.next({
					...this.tableService.tableConfigSubject.getValue(),
					columns: [...this.tableService.tableConfigSubject.getValue().columns]
				});
				this.dataList$ = this.tableService.dataList$;
			}),
			catchError(() => {
				return of([]);
			})
		).subscribe();
	}

	private openDialog<T>(component: new (...args: any[]) => T, data?: any): Observable<any> {
		const dialogRef: MatDialogRef<T> = this.dialog.open(component, {
			width: '650px',
			data
		});
		return dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$));
	}

	private isChanged(newValue: any, originalValue: any): boolean {
		return newValue !== null && newValue !== undefined && newValue !== originalValue;
	}
}
