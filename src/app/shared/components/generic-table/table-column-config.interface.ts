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
}

export enum TemplateType {
	Text = 'text',
	Date = 'date',
	Time = 'time',
	Custom = 'custom'
}
