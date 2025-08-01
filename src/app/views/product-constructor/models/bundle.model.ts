import { UsageUnit } from './common.model';

export interface MobileBundle {
  id: string;
  name: string;
  usageUnits: UsageUnit[];
}

export interface CreateBundleRequest {
  name: string;
  usageUnits: UsageUnit[];
}

export interface UpdateBundleRequest {
  name: string;
  usageUnits: UsageUnit[];
}

export interface BundleSearchParams {
  name?: string;
  type?: string;
}