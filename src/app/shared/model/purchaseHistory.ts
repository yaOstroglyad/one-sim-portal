import { UsageInfo } from './usageInfo';
import UsageTypeEnum = UsageInfo.UsageTypeEnum;
import { ProviderData } from './provider';

export interface TransactionOrder {
  type: string;
  status: string;
  data: any;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  externalTransactionId: string;
  triggerType: string;
}

export interface ProductPurchase {
  id: string;
  productId: string;
  productName: string;
  status: string;
  purchasedAt: string;
  price: Price;
  usage: Usage;
  updatedAt: string;
  updatedBy: string;
  providerData: ProviderData;
}

export interface Price {
  price: number;
  currency: string;
}

export interface Usage {
  startedAt: string;
  expiredAt: string;
  balance: Balance[];
}

export interface Balance {
  type: UsageTypeEnum;
  unitType: UsageInfo.UnitTypeDataEnum | UsageInfo.UnitTypeAmountEnum;
  total: number;
  used: number;
  remaining: number;
}
