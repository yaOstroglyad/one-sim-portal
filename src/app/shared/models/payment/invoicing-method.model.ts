import { FormConfig } from '../ui/field-config.model';

export interface InvoiceComponentConfig {
	id: string,
	isActive: boolean,
	type: string,
	config: FormConfig
}

export interface InvoicingMethod {
  id?: string,
  companyId?: string,
  name: string,
  isActive?: boolean,
  invoicingStrategy?: string,
	invoicingParameters?: InvoicingParameters,
  createdDate?: string
}

export interface InvoicingParameters {
	[key: string]: string;
}