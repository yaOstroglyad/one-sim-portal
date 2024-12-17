import { Customer } from './customer';
import { Provider, ProviderData } from './provider';

export interface Subscriber {
  id: string;
  name: string;
  status: string;
  externalId: string;
  providerData: ProviderData;
  simId: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface SimInfo {
  createdAt: string;
  createdBy: string;
  customer: Partial<Customer>
  externalReferenceId: string | null;
  iccid: string;
  id: string;
  imei: string | null;
  imsi: string;
  msisdn: string;
  networkStatus: string;
  qrCode: string;
  serviceProvider: Provider;
  status: string;
  updatedAt: string;
  updatedBy: string | null;
}
