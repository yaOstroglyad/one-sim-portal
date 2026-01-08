import { Subscriber } from '../subscriber/subscriber-info.model';
import { Company } from './company.model';

export enum CustomerType {
  Corporate = 'CORPORATE',
  Private = 'PRIVATE'
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
