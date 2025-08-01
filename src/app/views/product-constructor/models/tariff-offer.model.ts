import { Currency, PageRequest } from './common.model';

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
  price: number;
  currency: Currency;
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