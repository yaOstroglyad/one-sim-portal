import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService } from 'src/app/shared';
import { map } from 'rxjs/operators';
import { Provider } from '../../shared/model/provider';

@Injectable({
	providedIn: 'root'
})
export class ProvidersTableService extends TableConfigAbstractService {
	private originalDataSubject = new BehaviorSubject<Provider[]>([]);
	public data$: Observable<Provider[]> = this.originalDataSubject.asObservable();
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

	public updateData(data: Provider[]): void {
		this.originalDataSubject.next(data);
	}

	public applyFilter(filterValues: any): void {
		if (!filterValues) {
			this.data$ = this.originalDataSubject.asObservable();
		} else {
			this.data$ = this.originalDataSubject.pipe(
				map(data => data.filter(item =>
					(filterValues.name ? item.name.toUpperCase().includes(filterValues.name.toUpperCase()) : true)
				))
			);
		}
	}
}
