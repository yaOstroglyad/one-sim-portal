import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from 'src/app/shared';
import { map } from 'rxjs/operators';
import { Package } from '../../shared/model/package';

@Injectable({
	providedIn: 'root'
})
export class ProductsTableService extends TableConfigAbstractService {
	private originalDataSubject = new BehaviorSubject<Package[]>([]);
	public dataList$: Observable<Package[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		translatePrefix: 'package.',
		showCheckboxes: false,
		showEditButton: true,
		columns: [
			{visible: true, key: 'id', header: 'id'},
			{visible: true, key: 'name', header: 'name' },
			{visible: true, key: 'providerName', header: 'providerName' },
			{visible: true, key: 'effectiveDate', header: 'effectiveDate' },
			{visible: true, key: 'price', header: 'price' },
		]
	});


	constructor() {
		super();
	}

	public updateTableData(data: Package[]): void {
		this.originalDataSubject.next(data);
	}

	public addCustomColumns(parent: any): void {
		const currentConfig = this.tableConfigSubject.value;
		const newConfig = { ...currentConfig, columns: [...currentConfig.columns] };

		if (!newConfig.columns.find(c => c.key === 'usages')) {
			newConfig.columns.push({
				visible: true,
				key: 'usages',
				header: 'usages',
				templateType: TemplateType.Custom,
				customTemplate: () => parent.usageTemplate
			});
		}

		this.tableConfigSubject.next(newConfig);
	}

	applyFilter(filterValues: any): void {
		if (!filterValues) {
			this.dataList$ = this.originalDataSubject.asObservable();
		} else {
			this.dataList$ = this.originalDataSubject.pipe(
				map(data => data.filter(item =>
					(filterValues.name ? item.name.toUpperCase().includes(filterValues.name.toUpperCase()) : true)
				))
			);
		}
	}
}
