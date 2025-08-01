import { ServiceProvider, ServiceCoverage, PageRequest, PageResponse, SortInfo, PageableInfo } from './common.model';

export interface ProviderProductData {
  empty: boolean;
  [key: string]: any;
}

export interface ProviderProduct {
  id: string;
  serviceProvider: ServiceProvider;
  serviceCoverage: ServiceCoverage;
  commonProviderData: ProviderProductData;
  productProviderData: { [key: string]: ProviderProductData };
  active: boolean;
}

export interface ProviderProductSearchParams {
  countryId?: number;
  regionId?: number;
  providerId?: string;
}

export interface ProviderProductSearchRequest {
  searchParams: ProviderProductSearchParams;
  page: PageRequest;
}

export interface ProviderProductResponse extends PageResponse<ProviderProduct> {}

export interface ProviderProductUploadRequest {
  file: File;
  providerId?: string;
  countryId?: number;
  regionId?: number;
}