export enum TableFilterFieldType {
	Text = 'text',
	Select = 'select',
	Number = 'number'
}
export interface HeaderConfig {
	[key: string]: {
		type: TableFilterFieldType;
		placeholder?: string;
		defaultValue?: any;
		options?: Array<{ label: string; value: any }>;
	};
}
