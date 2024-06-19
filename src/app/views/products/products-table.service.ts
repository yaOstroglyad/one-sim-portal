import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from 'src/app/shared';
import { map } from 'rxjs/operators';
import { Package } from '../../shared/model/package';
import { deepSearch } from '../../shared/utils/utils';

@Injectable({
	providedIn: 'root'
})
export class ProductsTableService extends TableConfigAbstractService<Package> {
	public originalDataSubject = new BehaviorSubject<Package[]>([]);
	public dataList$: Observable<Package[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		translatePrefix: 'package.',
		showCheckboxes: false,
		showEditButton: true,
		showAddButton: true,
		columns: [
			{visible: true, key: 'name', header: 'name' },
			{visible: true, key: 'description', header: 'description' },
			{visible: true, key: 'price', header: 'price' },
			{visible: true, key: 'currency', header: 'currency' }
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

		if(!newConfig.columns.find(c => c.key === 'customers')) {
			newConfig.columns.push({
				visible: true,
				key: 'customers',
				header: 'customers',
				templateType: TemplateType.Custom,
				customTemplate: () => parent.customersTemplate
			});
		}

		if(!newConfig.columns.find(c => c.key === 'validity')) {
			newConfig.columns.push({
				visible: true,
				key: 'validity',
				header: 'validity',
				templateType: TemplateType.Custom,
				customTemplate: () => parent.validityTemplate
			});
		}

		this.tableConfigSubject.next(newConfig);
	}
}
