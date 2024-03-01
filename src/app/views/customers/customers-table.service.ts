import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService } from 'src/app/shared';
import { map } from 'rxjs/operators';
import { Customer } from '../../shared/model/customer';

@Injectable({
	providedIn: 'root'
})
export class CustomersTableService extends TableConfigAbstractService {
	private originalDataSubject = new BehaviorSubject<Customer[]>([]);
	public dataList$: Observable<Customer[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		translatePrefix: 'customer.',
		showCheckboxes: false,
		showEditButton: false,
		columns: [
			{visible: true, key: 'id', header: 'id'},
			{visible: true, key: 'name', header: 'name' },
		]
	});


	constructor() {
		super();
	}

	public updateTableData(data: Customer[]): void {
		this.originalDataSubject.next(data);
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
