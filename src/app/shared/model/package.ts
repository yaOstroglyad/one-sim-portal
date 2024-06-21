import { UsageInfo } from './usageInfo';

export interface Package {
  id: string,
  name: string,
  usages: UsageInfo[],
  providerName?: string,
  effectiveDate?: string,
  price?: string,
}
