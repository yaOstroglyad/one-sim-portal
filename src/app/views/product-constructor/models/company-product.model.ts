import { ServiceCoverage, UsageUnit, ValidityPeriod, PageRequest, Company, Currency } from './common.model';

export interface CompanyProductServiceProvider {
  id: string;
  name: string;
}

export interface CompanyProductTariffOffer {
  id: string;
  serviceProvider: CompanyProductServiceProvider;
  price: number;
  currency: string;
  validFrom: string;
}

export interface CompanyProduct {
  id: string;
  company: Company;
  name: string;
  description: string;
  serviceCoverage: ServiceCoverage;
  price: number | null;
  currency: Currency | null;
  tariffOfferId?: string;
  tariffOffer?: CompanyProductTariffOffer;
  usageUnits: UsageUnit[];
  validityPeriod: ValidityPeriod;
  createdAt?: string;
  active: boolean;
}

export interface RetailPrice {
  tariffOfferId: string;
  price: number;
  currency: string;
  validFrom: string;
}

export interface CreateCompanyProductRequest {
  companyAccountId: string;
  productId: string;
  retailPrice: RetailPrice;
  description: string;
  validityPeriod: ValidityPeriod;
}

export interface UpdateCompanyProductRequest {
  retailPrice?: RetailPrice;
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