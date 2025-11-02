// Common interfaces used across the Product Constructor
// Re-export shared pagination types for backward compatibility
export { PageRequest, PageResponse, SortInfo, PageableInfo } from '@shared/models/core';

export interface Country {
  id: number;
  name: string;
  isoAlphaCode2: string;
  isoAlphaCode3: string;
  dialingCode: string;
}

export interface ServiceCoverage {
  id: number;
  name: string;
  type: 'COUNTRY' | 'REGION';
}

export interface ValidityPeriod {
  period: number;
  timeUnit: 'days' | 'weeks' | 'months' | 'years';
}

export interface UsageUnit {
  value: number;
  type: 'data' | 'voice' | 'sms';
  unitType: 'Byte' | 'KB' | 'MB' | 'GB' | 'TB' | 'Seconds' | 'Minutes' | 'Hours' | 'Messages';
}

export interface ServiceProvider {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  accountId: string;
}

// Currency type - use ProductsDataService.getCurrencies() for available currencies
export type Currency = string;

export interface StatusUpdate {
  isActive: boolean;
}