import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from 'src/app/shared';
import { InvoicingMethod } from 'src/app/shared/model/invoicing-method';

@Injectable({
  providedIn: 'root'
})
export class InvoicingGatewayConfigService extends TableConfigAbstractService<any> {
	isActiveFlagTemplate: TemplateRef<any>;

	public originalDataSubject = new BehaviorSubject<InvoicingMethod[]>([]);
	public dataList$: Observable<InvoicingMethod[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		translatePrefix: 'invoicingGateway.',
		showCheckboxes: false,
		showEditButton: true,
		showAddButton: true,
		showMenu: true,
		columns: [
			{ visible: false, key: 'id', header: 'id' },
			{ visible: true, key: 'name', header: 'name' },
			{
				visible: true,
				key: 'isActive',
				header: 'isActive',
				templateType: TemplateType.Custom,
				customTemplate: () => this.isActiveFlagTemplate
			},
			{ visible: true, key: 'invoicingStrategy', header: 'invoicingStrategy' },
			{ visible: true, key: 'createdDate', header: 'createdDate', templateType: TemplateType.Date },
		],
	});

	constructor() {
		super();
	}

	public updateTableData(data: InvoicingMethod[]): void {
		this.originalDataSubject.next(data);
	}

	public getTableConfig(): BehaviorSubject<TableConfig> {
		return this.tableConfigSubject;
	}
}