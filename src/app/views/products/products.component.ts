import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Package } from '../../shared/model/package';
import { cilPencil } from '@coreui/icons';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { ProductsTableService } from './products-table.service';
import { ProductsDataService } from './products-data.service';
import { packagesMock } from './products-mock';

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
	public data$: Observable<Package[]>;
	public filterConfig: FilterConfig = {
		name: {type: TableFilterFieldType.Text, placeholder: 'Filter by name'}
	};

	constructor(private cdr: ChangeDetectorRef,
							private tableService: ProductsTableService,
							private productsDataService: ProductsDataService
	) {
	}

	ngOnInit(): void {
		this.productsDataService.getData().subscribe(data => {
			this.tableService.updateData(data);
      this.tableService.addCustomColumns(this);
			this.tableConfig$ = this.tableService.getTableConfig();
			this.data$ = this.tableService.data$;
			this.cdr.detectChanges();
		});
	}

	applyFilter(filterValues: any): void {
		this.tableService.applyFilter(filterValues);
		this.data$ = this.tableService.data$;
	}

	onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	edit(product: Package): void {
		console.log('product', product);
		this.selectedData = product;
		this.setModalVisibility(true);
	}

	setModalVisibility(event: boolean): void {
		this.visible = event;
		console.log('this.visible setModalVisibility', this.visible);
	}
}
