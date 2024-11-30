import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from 'src/app/shared';

@Injectable({
	providedIn: 'root'
})
export class PaymentGatewayTableConfigService extends TableConfigAbstractService<any> {
	isActiveFlagTemplate: TemplateRef<any>;
	isPrimaryFlagTemplate: TemplateRef<any>;

	public originalDataSubject = new BehaviorSubject<any[]>([]);
	public dataList$: Observable<any[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		translatePrefix: 'paymentGateway.',
		showCheckboxes: false,
		showEditButton: true,
		showAddButton: true,
		showMenu: true,
		columns: [
			{ visible: true, key: 'id', header: 'id' },
			{ visible: true, key: 'name', header: 'name' },
			{
				visible: true,
				key: 'isActive',
				header: 'isActive',
				templateType: TemplateType.Custom,
				customTemplate: () => this.isActiveFlagTemplate
			},
			{
				visible: true,
				key: 'primary',
				header: 'isPrimary',
				templateType: TemplateType.Custom,
				customTemplate: () => this.isPrimaryFlagTemplate
			},
			{ visible: true, key: 'paymentStrategy', header: 'paymentStrategy' },
			{ visible: true, key: 'createdDate', header: 'createdDate', templateType: TemplateType.Date },
		],
	});

	constructor() {
		super();
	}

	public updateTableData(data: any[]): void {
		this.originalDataSubject.next(data);
	}
}
