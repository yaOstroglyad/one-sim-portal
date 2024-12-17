import { Subscriber } from './subscriberInfo';

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
  parentCustomer?: ParentCustomer;
  tags?: string[];
}

export interface ParentCustomer {
  id: string;
  name: string;
}

export interface DataObject {
  customer: Customer;
  subscribers: Subscriber[];
}
