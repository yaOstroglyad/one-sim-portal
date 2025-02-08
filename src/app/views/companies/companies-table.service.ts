import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Company, TableConfig, TableConfigAbstractService } from '../../shared';


@Injectable({
	providedIn: 'root'
})
export class CompaniesTableService extends TableConfigAbstractService<Company> {
	public originalDataSubject = new BehaviorSubject<Company[]>([]);
	public dataList$: Observable<Company[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: true,
			serverSide: true,
			totalPages: 20
		},
		translatePrefix: 'company.',
		showCheckboxes: false,
		showEditButton: true,
		showAddButton: true,
		showMenu: true,
		columns: [
			{visible: false, key: 'id', header: 'id'},
			{visible: true, key: 'name', header: 'name' },
			{visible: true, key: 'status', header: 'status' },
			{visible: true, key: 'type', header: 'type' },
			{visible: true, key: 'tags', header: 'tags' },
			{visible: true, key: 'description', header: 'description' },
		]
	});

	constructor() {
		super();
	}

	public updateTableData(data: Company[]): void {
		this.originalDataSubject.next(data);
	}
}
