import { ServiceCoverage, UsageUnit, ValidityPeriod, PageRequest, Company, Currency } from './common.model';

export interface CompanyProduct {
  id: string;
  company: Company;
  name: string;
  description: string;
  serviceCoverage: ServiceCoverage;
  price: number | null;
  currency: Currency | null;
  tariffOfferId?: string;
  usageUnits: UsageUnit[];
  validityPeriod: ValidityPeriod;
  createdAt?: string;
  active: boolean;
}

export interface RetailTariff {
  tariffOfferId: string;
  price: number;
  currency: string;
}

export interface CreateCompanyProductRequest {
  companyAccountId: string;
  productId: string;
  retailTariff: RetailTariff;
  description: string;
  validityPeriod: ValidityPeriod;
}

export interface UpdateCompanyProductRequest {
  retailTariff?: RetailTariff;
  description?: string;
  validityPeriod?: ValidityPeriod;
}

export interface CompanyProductStatusRequest {
  isActive: boolean;
}

export interface CompanyProductSearchParams {
  countryId?: number;
  regionId?: number;
  accountId?: string;
}

export interface CompanyProductSearchRequest {
  searchParams: CompanyProductSearchParams;
  page: PageRequest;
}