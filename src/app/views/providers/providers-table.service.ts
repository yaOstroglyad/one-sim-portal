import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService } from 'src/app/shared';
import { Provider } from '../../shared/model/provider';

@Injectable({
	providedIn: 'root'
})
export class ProvidersTableService extends TableConfigAbstractService<Provider> {
	public originalDataSubject = new BehaviorSubject<Provider[]>([]);
	public dataList$: Observable<Provider[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		translatePrefix: 'provider.',
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

	public updateTableData(data: Provider[]): void {
		this.originalDataSubject.next(data);
	}
}
