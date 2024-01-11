export enum TableFilterFieldType {
	Text = 'text',
	Select = 'select',
	Number = 'number'
}
export interface FilterConfig {
	[key: string]: {
		type: TableFilterFieldType;
		options?: Array<{ label: string; value: any }>;
		placeholder: string;
	};
}
