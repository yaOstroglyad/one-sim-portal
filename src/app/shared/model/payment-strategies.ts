import { FormConfig } from '../components/form-generator/field-config';

export interface PgComponentConfig {
	id: string,
	isActive: boolean,
	type: string,
	config: FormConfig
}

export interface PaymentStrategies {
  "id"?: string,
  "name": string,
  "isActive"?: boolean,
  "paymentStrategy": string,
  "paymentMethodParameters": {
    [key: string]: string;
  },
  "createdDate"?: string
}
