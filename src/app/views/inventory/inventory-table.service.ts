import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from 'src/app/shared';
import { Resource } from '../../shared/model/resource';

@Injectable({
	providedIn: 'root'
})
export class InventoryTableService extends TableConfigAbstractService<Resource> {
	public originalDataSubject = new BehaviorSubject<Resource[]>([]);
	public dataList$: Observable<Resource[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: true,
			serverSide: true,
			totalPages: 20
		},
		translatePrefix: 'resource.',
		showCheckboxes: false,
		showEditButton: false,
		columns: [
			{visible: true, key: 'iccid', header: 'iccid'},
			{visible: true, key: 'imei', header: 'imei'},
			{visible: true, key: 'imsi', header: 'imsi'},
			{visible: true, key: 'msisdn', header: 'msisdn'},
			{visible: true, templateType: TemplateType.Text, key: 'customer.name', header: 'customer'},
			{visible: true, templateType: TemplateType.Text, key: 'serviceProvider.name', header: 'provider'},
			{visible: true, key: 'status', header: 'status'}
		]
	});


	constructor() {
		super();
	}

	public updateTableData(data: Resource[]): void {
		this.originalDataSubject.next(data);
	}

	public updateConfigData(totalPages: number): void {
		const currentConfig = this.tableConfigSubject.value;
		const updatedConfig = {
			...currentConfig,
			pagination: {
				...currentConfig.pagination,
				totalPages
			}
		};

		this.tableConfigSubject.next(updatedConfig);
	}
}
