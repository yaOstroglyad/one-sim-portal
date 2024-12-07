import { UsageInfo } from './usageInfo';

export enum StatusEnum {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Terminated = 'terminated'
}

export interface Package {
  id: string,
  name: string,
  usages: UsageInfo[],
  providerName?: string,
  effectiveDate?: string,
  status?: string,
  price?: string,
}

export interface RefundableProduct {
  id: string;
  name: string;
  price: {
    price: number;
    currency: string;
  };
  purchasedAt: number;
  status: "ACTIVE" | "INACTIVE" | "REFUNDED";
}
