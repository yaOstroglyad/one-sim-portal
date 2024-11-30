import { FormConfig } from '../components/form-generator/field-config';

export interface PgComponentConfig {
	id: string,
	isActive: boolean,
	type: string,
	config: FormConfig
}

export interface PaymentStrategy {
  "id"?: string,
  "name": string,
  "isActive"?: boolean,
  "primary"?: boolean,
  "paymentStrategy"?: string,
	"paymentMethodParameters"?: PaymentMethodParameters,
  "createdDate"?: string
}

export interface PaymentMethodParameters {
	client_id?: string;
	client_secret?: string;
	type?: string;
	oauth_token?: string;
	samo_action?: string;
	[key: string]: string;
}
