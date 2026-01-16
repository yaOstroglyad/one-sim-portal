import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { Package, StatusEnum } from '@shared/models/product';
import { Observable, Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  HeaderConfig,
  ProductsDataService,
  TableConfig,
  TableFilterFieldType,
  GenericTableComponent,
  HeaderComponent
} from '@shared';
import { ProductsTableService } from './products-table.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditProductComponent } from './edit-product/edit-product.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { ChangeStatusDialogComponent } from './change-status-dialog/change-status-dialog.component';
import {
	DynamicEntityDetailsDialogComponent
} from '@shared/components/dynamic-entity-details-dialog/dynamic-entity-details-dialog.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BadgeComponent } from '@coreui/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ItemNamesPipe } from '@shared/pipes/item-names/item-names.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    standalone: true,
    selector: 'app-products',
    imports: [
    BadgeComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    GenericTableComponent,
    HeaderComponent,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    ItemNamesPipe,
    MatTooltipModule,
    MatMenuModule,
    TranslateModule,
],
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit, OnDestroy {
	@ViewChild('usageTemplate') usageTemplate: TemplateRef<any>;
	@ViewChild('companiesTemplate') companiesTemplate: TemplateRef<any>;
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
		private translate: TranslateService,
		private dialog: MatDialog
	) {
		this.headerConfig = {
			value: { type: TableFilterFieldType.Text, placeholder: this.translate.instant('common.table.filterPlaceholder') }
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

	public openDetails(product?: Package): void {
		this.openDialog(DynamicEntityDetailsDialogComponent, product, '800px')
			.pipe(
				takeUntil(this.unsubscribe$),
				switchMap(() => {
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
				this.tableService.addCustomColumns(this);
				this.tableService.tableConfigSubject.next({
					...this.tableService.tableConfigSubject.getValue(),
					columns: [...this.tableService.tableConfigSubject.getValue().columns]
				});
				this.dataList$ = of(data);
			}),
			catchError(() => {
				return of([]);
			})
		).subscribe();
	}

	private openDialog<T>(component: new (...args: any[]) => T, data?: any, width = '650px'): Observable<any> {
		const dialogRef: MatDialogRef<T> = this.dialog.open(component, {
			width,
			data
		});
		return dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$));
	}

	private isChanged(newValue: any, originalValue: any): boolean {
		return newValue !== null && newValue !== undefined && newValue !== originalValue;
	}
}
