import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Package } from '../../shared/model/package';
import { BehaviorSubject, Observable } from 'rxjs';
import { HeaderConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { ProductsTableService } from './products-table.service';
import { ProductsDataService } from './products-data.service';
import { TranslateService } from '@ngx-translate/core';

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
							public translateService: TranslateService
	) {
		this.initheaderConfig();
	}

	ngOnInit(): void {
		this.productsDataService.list().subscribe(data => {
			this.tableService.updateTableData(data);
			this.tableService.addCustomColumns(this);
			this.tableConfig$ = this.tableService.getTableConfig();
			this.dataList$ = this.tableService.dataList$;
			this.cdr.detectChanges();
		});
	}

	private initheaderConfig(): void {
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

	setModalVisibility(event: boolean): void {
		this.visible = event;
		console.log('this.visible setModalVisibility', this.visible);
	}

	edit(product: Package): void {
		console.log('product', product);
		this.selectedData = product;
		this.setModalVisibility(true);
	}
}
