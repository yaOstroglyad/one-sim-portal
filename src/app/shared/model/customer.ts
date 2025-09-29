import { Subscriber } from './subscriberInfo';
import { Company } from './company';

export enum CustomerType {
  Corporate = 'Corporate',
  Private = 'Private'
}

export interface Customer {
  id: string,
  name: string,
  description: string,
  type: CustomerType
  status?: string;
  accountId?: string;
  parentCustomer?: ParentCustomer;
  tags?: string[];
  company?: Company;
}

export interface ParentCustomer {
  id: string;
  name: string;
}

export interface DataObject {
  customer: Customer;
  subscribers: Subscriber[];
  userProfile: any
}
