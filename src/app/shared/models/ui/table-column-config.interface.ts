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
	footer?: TableFooterConfig;
}

export interface TableFooterConfig {
	enabled: boolean;
	aggregations?: AggregationConfig[]; // Simple aggregations (sum, avg, etc.)
	customValues?: Record<string, string>; // Pre-calculated values from strategy
	customTooltips?: Record<string, string>; // Tooltip text for custom values (e.g., currency breakdown)
	label?: string; // Label for first column (e.g., "Total:")
}

export interface AggregationConfig {
	columnKey: string;
	type: AggregationType;
	formatFn?: (value: number) => string; // Custom formatting function
}

export enum AggregationType {
	Sum = 'sum',
	Average = 'avg',
	Count = 'count',
	Min = 'min',
	Max = 'max'
}

export enum TemplateType {
	Text = 'text',
	Date = 'date',
	Time = 'time',
	Custom = 'custom'
}
