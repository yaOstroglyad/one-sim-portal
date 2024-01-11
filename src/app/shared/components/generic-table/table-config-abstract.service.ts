import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig } from './table-column-config.interface';

@Injectable({
	providedIn: 'root'
})
export class TableConfigAbstractService {
	tableConfigSubject: any;

	updateColumnVisibility(updatedVisibleColumns: Set<string>): void {
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

	getTableConfig(): BehaviorSubject<TableConfig> {
		return this.tableConfigSubject;
	}
}
