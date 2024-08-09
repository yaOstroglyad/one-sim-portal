import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from 'src/app/shared';
import { Order } from '../../shared/model/order';

@Injectable({
	providedIn: 'root'
})
export class OrdersTableService extends TableConfigAbstractService<Order> {
	public originalDataSubject = new BehaviorSubject<Order[]>([]);
	public dataList$: Observable<Order[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		translatePrefix: 'order.',
		showCheckboxes: false,
		showEditButton: true,
		showMenu: true,
		columns: [
			{visible: false, key: 'id', header: 'id'},
			{visible: true, key: 'description', header: 'description' },
			{visible: true, templateType: TemplateType.Date, dateFormat: 'dd/MM/YYYY', key: 'createdDate', header: 'createdDate' },
			{visible: true, key: 'type', header: 'type' },
			{visible: true, templateType: TemplateType.Text, key: 'fromOwner.name', header: 'fromOwner' },
			{visible: true, templateType: TemplateType.Text, key: 'toOwner.name', header: 'toOwner' }
		]
	});

	constructor() {
		super();
	}

	public updateTableData(data: Order[]): void {
		this.originalDataSubject.next(data);
	}
}
