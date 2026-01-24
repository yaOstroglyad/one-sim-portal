import { Company, Subscriber } from '@shared/models';

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

/**
 * Command for creating a new customer via Portal API
 * POST /api/v1/portal/command/create-customer
 */
export interface CreateCustomerCommand {
  companyId?: string;      // Required for admin only
  name: string;
  description?: string;
  externalId?: string;
  tags?: string[];
  type: CustomerType;
  customerEmail: string;
  customerPhone?: string;  // Not used in UI form (future feature)
}
