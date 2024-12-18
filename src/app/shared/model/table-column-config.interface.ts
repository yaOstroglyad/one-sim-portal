import { TemplateRef } from '@angular/core';

export interface TableColumnConfig {
	key: string;
	header: string;
	templateType?: TemplateType;
	dateFormat?: string;
	customTemplate?: () => TemplateRef<any>;
	visible: boolean;
}

export interface TableConfig {
	columns: TableColumnConfig[];
	translatePrefix?: string;
	showCheckboxes?: boolean;
	showEditButton?: boolean;
	showAddButton?: boolean;
	showMenu?: boolean;
	pagination?: {
		enabled: boolean;
		serverSide: boolean;
		page?: number,
		totalPages?: number,
		size?: number
	};
}

export enum TemplateType {
	Text = 'text',
	Date = 'date',
	Time = 'time',
	Custom = 'custom'
}
