import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig } from './table-column-config.interface';
import { map } from 'rxjs/operators';
import { deepSearch } from '../../utils/utils';
import { Resource } from '../../model/resource';

@Injectable({
	providedIn: 'root'
})
export class TableConfigAbstractService<T> {
	public originalDataSubject = new BehaviorSubject<T[]>([]);
	public dataList$: Observable<T[]> = this.originalDataSubject.asObservable();
	tableConfigSubject: any;

	public updateColumnVisibility(updatedVisibleColumns: Set<string>): void {
		const currentConfig = this.tableConfigSubject.value;
		const updatedConfig = {
			...currentConfig,
			columns: currentConfig.columns.map(col => ({
				...col,
				visible: updatedVisibleColumns.has(col.header)
			}))
		};

		this.tableConfigSubject.next(updatedConfig);
	}

	public getTableConfig(): BehaviorSubject<TableConfig> {
		return this.tableConfigSubject;
	}

	public applyFilter(filterForm: any): void {
		if (filterForm && filterForm.value !== undefined) {
			const lowerCaseFilterString = filterForm.value.toLowerCase();
			this.dataList$ = this.originalDataSubject.pipe(
				map(data => data.filter(item => deepSearch(item, lowerCaseFilterString)))
			);
		} else {
			this.dataList$ = this.originalDataSubject.asObservable();
			console.error('Filter value is not initialized in filterForm');
		}
	}
}
