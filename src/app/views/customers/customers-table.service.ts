import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService } from 'src/app/shared';
import { Customer } from '../../shared';

@Injectable({
	providedIn: 'root'
})
export class CustomersTableService extends TableConfigAbstractService<Customer> {
	public originalDataSubject = new BehaviorSubject<Customer[]>([]);
	public dataList$: Observable<Customer[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: true,
			serverSide: true,
			totalPages: 20
		},
		translatePrefix: 'customer.',
		showCheckboxes: false,
		showEditButton: true,
		showAddButton: true,
		showMenu: true,
		columns: [
			{visible: false, key: 'id', header: 'id'},
			{visible: true, key: 'name', header: 'name' },
			{visible: true, key: 'type', header: 'type' },
			{visible: true, key: 'tags', header: 'tags' },
			{visible: true, key: 'description', header: 'description' },
		]
	});

	constructor() {
		super();
	}

	public updateTableData(data: Customer[]): void {
		this.originalDataSubject.next(data);
	}
}
