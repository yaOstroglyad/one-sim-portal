import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  CompanyProductPrice,
  CreateCompanyProductPriceRequest,
  UpdateCompanyProductPriceRequest
} from '../models';
import { handleArrayError, handleObjectError } from '@shared/utils';

/**
 * Service for managing company product prices (pricing schedule)
 * Handles CRUD operations for company-specific pricing with validFrom dates
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyProductPriceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api-product/api/v1/esim-product/company-products';

  getPrices(companyProductId: string): Observable<CompanyProductPrice[]> {
    return this.http.get<CompanyProductPrice[]>(`${this.baseUrl}/${companyProductId}/prices`)
      .pipe(
        catchError(handleArrayError<CompanyProductPrice>('Failed to load company product prices'))
      );
  }

  createPrice(
    companyProductId: string,
    request: CreateCompanyProductPriceRequest
  ): Observable<CompanyProductPrice> {
    return this.http.post<CompanyProductPrice>(`${this.baseUrl}/${companyProductId}/prices`, request)
      .pipe(
        catchError(handleObjectError<CompanyProductPrice>('Failed to create company product price'))
      );
  }

  updatePrice(
    companyProductId: string,
    priceId: string,
    request: UpdateCompanyProductPriceRequest
  ): Observable<CompanyProductPrice> {
    return this.http.put<CompanyProductPrice>(`${this.baseUrl}/${companyProductId}/prices/${priceId}`, request)
      .pipe(
        catchError(handleObjectError<CompanyProductPrice>('Failed to update company product price'))
      );
  }
}
