import { ServiceCoverage, UsageUnit, ValidityPeriod, PageRequest, Company, Currency } from './common.model';

export interface CompanyProduct {
  id: string;
  company: Company;
  name: string;
  description: string;
  serviceCoverage: ServiceCoverage;
  price: number;
  currency: Currency;
  usageUnits: UsageUnit[];
  validityPeriod: ValidityPeriod;
  active: boolean;
}

export interface CreateCompanyProductRequest {
  companyId?: string;
  productId: string;
  description?: string;
}

export interface UpdateCompanyProductRequest {
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