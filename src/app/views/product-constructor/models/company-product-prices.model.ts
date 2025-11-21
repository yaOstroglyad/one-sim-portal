import { Currency } from './common.model';

/**
 * Company Product Price - represents a pricing entry in the company's pricing schedule
 * Each price has a validFrom date, allowing companies to schedule future price changes
 */
export interface CompanyProductPrice {
  id: string;
  companyProductId: string;
  tariffOfferId: string;
  price: number;
  currency: Currency;
  validFrom: string; // ISO date string "2025-11-20"
}

/**
 * Request to create a new company product price
 */
export interface CreateCompanyProductPriceRequest {
  tariffOfferId: string;
  price: number;
  currency: Currency;
  validFrom: string; // ISO date string "2025-11-20"
}

/**
 * Request to update an existing company product price
 */
export interface UpdateCompanyProductPriceRequest {
  price: number;
  currency: Currency;
  validFrom: string; // ISO date string "2025-11-20"
}
