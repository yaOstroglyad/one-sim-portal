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

export interface PaymentMethodParameters {
	client_id?: string;
	client_secret?: string;
	type?: string;
	oauth_token?: string;
	samo_action?: string;
}

export interface PaymentGateway {
	id: string;
	name: string;
	isActive: boolean;
	primary: boolean;
	paymentStrategy: string;
	paymentMethodParameters: PaymentMethodParameters;
	createdDate: string;
}
