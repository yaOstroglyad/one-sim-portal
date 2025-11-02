import { UsageInfo } from './usage-info.model';
import UsageTypeEnum = UsageInfo.UsageTypeEnum;
import { ProviderData } from '../business/provider.model';

export interface TransactionOrder {
  id: string;
  externalTransactionId: string;
  status: string;
  type: string;
  triggerType: string;
  paymentMethod: string;
  price: number;
  currency: string;
  productName: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
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
