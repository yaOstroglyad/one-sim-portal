import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService } from 'src/app/shared';
import { map } from 'rxjs/operators';
import { Resource } from '../../shared/model/resource';

@Injectable({
	providedIn: 'root'
})
export class InventoryTableService extends TableConfigAbstractService {
	private originalDataSubject = new BehaviorSubject<Resource[]>([]);
	public dataList$: Observable<Resource[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		translatePrefix: 'resource.',
		showCheckboxes: false,
		showEditButton: false,
		columns: [
			{visible: true, key: 'id', header: 'id'},
			{visible: true, key: 'lpa', header: 'lpa' },
			{visible: true, key: 'server', header: 'server' },
			{visible: true, key: 'code', header: 'code' },
			{visible: true, key: 'oid', header: 'oid' },
		]
	});


	constructor() {
		super();
	}

	public updateTableData(data: Resource[]): void {
		this.originalDataSubject.next(data);
	}

	applyFilter(filterValues: any): void {
		if (!filterValues) {
			this.dataList$ = this.originalDataSubject.asObservable();
		} else {
			this.dataList$ = this.originalDataSubject.pipe(
				map(data => data.filter(item =>
					(filterValues.lpa ? item.lpa.toUpperCase().includes(filterValues.lpa.toUpperCase()) : true)
				))
			);
		}
	}
}
