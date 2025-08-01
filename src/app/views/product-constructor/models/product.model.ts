import { MobileBundle } from './bundle.model';
import { ServiceCoverage, ValidityPeriod, PageRequest } from './common.model';

export interface Product {
  id: string;
  name: string;
  description?: string;
  bundle: MobileBundle;
  serviceCoverage: ServiceCoverage;
  validityPeriod: ValidityPeriod;
  active: boolean;
}

export interface CreateProductRequest {
  name: string;
  bundleId: string;
  serviceCoverage: ServiceCoverage;
  validityPeriod: ValidityPeriod;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  validityPeriod: ValidityPeriod;
}

export interface ProductSearchParams {
  countryId?: number;
  regionId?: number;
  mobileBundleId?: string;
}

export interface ProductSearchRequest {
  searchParams: ProductSearchParams;
  page: PageRequest;
}