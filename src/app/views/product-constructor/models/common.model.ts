// Common interfaces used across the Product Constructor

export interface PageRequest {
  page: number;
  size: number;
  sort?: string[];
}

export interface PageResponse<T> {
  totalElements: number;
  totalPages: number;
  size: number;
  content: T[];
  number: number;
  sort: SortInfo;
  numberOfElements: number;
  pageable: PageableInfo;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableInfo {
  offset: number;
  sort: SortInfo;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

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

export type Currency = 'usd' | 'eur' | 'gbp' | 'ils' | 'rub' | 'uah';

export interface StatusUpdate {
  isActive: boolean;
}