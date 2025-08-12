import { Currency, PageRequest, ServiceProvider } from './common.model';

// Re-export Currency for use in components
export { Currency } from './common.model';
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

export interface ActiveTariffOffer {
  id?: string; // Optional for now, will be required when backend adds it
  productId: string;
  productName: string;
  serviceProvider: ServiceProvider;
  price: number | null;
  currency: Currency | null;
  validFrom: Date | string;
}