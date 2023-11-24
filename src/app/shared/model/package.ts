import { UsageInfo } from './usageInfo';

export interface Package {
  id: string,
  name: string,
  usages: UsageInfo[]
}
