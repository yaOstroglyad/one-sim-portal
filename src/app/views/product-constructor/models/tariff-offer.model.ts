import { Currency, PageRequest, ServiceProvider } from './common.model';

// Re-export Currency for use in components
export type { Currency } from './common.model';
import { Product } from './product.model';
import { ProviderProduct } from './provider-product.model';

export interface CreateTariffOfferRequest {
  productId: string;
  providerProductId: string;
  price: number;
  currency: Currency;
}

export interface UpdateTariffOfferRequest {
  price: number;
  currency: Currency;
}

export interface TariffOffer {
  id: string;
  product: Product;
  providerProduct: ProviderProduct;
  price: number | null;
  currency: Currency | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TariffOfferSearchParams {
  productId?: string;
  providerProductId?: string;
  currency?: Currency;
}

export interface TariffOfferSearchRequest {
  searchParams: TariffOfferSearchParams;
  page: PageRequest;
}

export interface ProviderProductInfo {
  id: string;
  serviceProvider: ServiceProvider;
  providerData?: {
    extensionId?: string;
    [key: string]: any;
  };
  price: number;
  currency: Currency;
  validFrom: string;
}

export interface ActiveTariffOffer {
  id?: string; // Optional for now, will be required when backend adds it
  productId: string;
  productName: string;
  // Support both old and new API response structures
  serviceProvider?: ServiceProvider; // Old structure
  providerProductInfo?: ProviderProductInfo; // New structure
  price: number | null;
  currency: Currency | null;
  validFrom: Date | string;
}