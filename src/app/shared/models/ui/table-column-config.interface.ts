import { TemplateRef } from '@angular/core';

export interface TableColumnConfig {
	key: string;
	header: string;
	templateType?: TemplateType;
	dateFormat?: string;
	customTemplate?: () => TemplateRef<any>;
	visible: boolean;
	sortable?: boolean;
	sortDirection?: 'asc' | 'desc' | null;
	class?: string;
	width?: string;
	minWidth?: string;
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
		page?: number;
		totalPages?: number;
		totalItems?: number;
		size?: number;
		showPageSizeSelector?: boolean;
		pageSizeOptions?: number[];
	};
}

export enum TemplateType {
	Text = 'text',
	Date = 'date',
	Time = 'time',
	Custom = 'custom'
}
