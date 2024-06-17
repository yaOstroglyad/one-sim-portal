import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Package } from '../../shared/model/package';
import { BehaviorSubject, Observable } from 'rxjs';
import { HeaderConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { ProductsTableService } from './products-table.service';
import { ProductsDataService } from './products-data.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { EditProductComponent } from './edit-product/edit-product.component';
import { CreateProductComponent } from './create-product/create-product.component';

@Component({
	selector: 'app-products',
	templateUrl: './products.component.html',
	styleUrls: ['./products.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {
	@ViewChild('usageTemplate') usageTemplate: TemplateRef<any>;
	public visible: boolean;
	public selectedData: Package;
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<Package[]>;
	public headerConfig: HeaderConfig = {};

	constructor(private cdr: ChangeDetectorRef,
							private tableService: ProductsTableService,
							private productsDataService: ProductsDataService,
							private dialog: MatDialog,
							public translateService: TranslateService,
	) {
		this.initHeaderConfig();
	}

	ngOnInit(): void {
		this.getProducts();
	}

	private initHeaderConfig(): void {
		this.headerConfig = {
			name: {type: TableFilterFieldType.Text, placeholder: 'Filter by name'}
		};
	}

	applyFilter(filterValues: any): void {
		this.tableService.applyFilter(filterValues);
		this.dataList$ = this.tableService.dataList$;
	}

	onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	create(): void {
		const dialogRef = this.dialog.open(CreateProductComponent, {
			width: '650px'
		});

		dialogRef.afterClosed().subscribe(result => {
			this.productsDataService.create(result).subscribe(e => {
				this.getProducts();
			});
		});
	}

	edit(product?: Package): void {
		const dialogRef = this.dialog.open(EditProductComponent, {
			width: '650px',
			data: product
		});

		dialogRef.afterClosed().subscribe(result => {
			this.productsDataService.update(result).subscribe(e => {
				this.getProducts();
			});
		});
	}

	getProducts() {
		this.productsDataService.list().subscribe(data => {
			this.tableService.updateTableData(data);
			this.tableService.addCustomColumns(this);
			this.tableConfig$ = this.tableService.getTableConfig();
			this.dataList$ = this.tableService.dataList$;
			this.cdr.detectChanges();
		});
	}
}
