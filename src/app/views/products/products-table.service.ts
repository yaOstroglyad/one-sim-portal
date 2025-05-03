import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from 'src/app/shared';
import { Package } from '../../shared/model/package';

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
		showMenu: true,
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

	public addCustomColumns(parent: any): void {
		const currentConfig = this.tableConfigSubject.value;
		const newConfig = { ...currentConfig, columns: [...currentConfig.columns] };

		if (!newConfig.columns.find(c => c.key === 'status')) {
			newConfig.columns.push({
				visible: true,
				key: 'status',
				header: 'status',
				templateType: TemplateType.Custom,
				customTemplate: () => parent.statusTemplate
			});
		}

		if(!newConfig.columns.find(c => c.key === 'companies')) {
			newConfig.columns.push({
				visible: true,
				key: 'companies',
				header: 'companies',
				templateType: TemplateType.Custom,
				customTemplate: () => parent.companiesTemplate
			});
		}

		if (!newConfig.columns.find(c => c.key === 'usages')) {
			newConfig.columns.push({
				visible: true,
				key: 'usages',
				header: 'usages',
				templateType: TemplateType.Custom,
				customTemplate: () => parent.usageTemplate
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
