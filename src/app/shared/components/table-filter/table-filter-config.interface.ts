export enum TableFilterFieldType {
	Text = 'text',
	Select = 'select',
	Number = 'number'
}
export interface FilterConfig {
	[key: string]: {
		type: TableFilterFieldType;
		placeholder?: string;
		options?: Array<{ label: string; value: any }>;
	};
}
