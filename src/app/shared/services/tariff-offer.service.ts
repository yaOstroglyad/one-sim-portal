import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CreateTariffOfferRequest,
  UpdateTariffOfferRequest,
  TariffOffer,
  TariffOfferSearchRequest,
  ActiveTariffOffer
} from '../../views/product-constructor/models';
import { CacheHubService, DataType } from './cache-hub';

@Injectable({
  providedIn: 'root'
})
export class TariffOfferService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/tariff-offers';

  constructor(
    private http: HttpClient,
    private cacheHub: CacheHubService
  ) {}

  getTariffOffers(): Observable<TariffOffer[]> {
    return this.cacheHub.get(
      'tariff-offers:list',
      () => this.http.get<TariffOffer[]>(this.baseUrl),
      { dataType: DataType.BUSINESS }
    );
  }

  getTariffOfferById(id: string): Observable<TariffOffer> {
    return this.cacheHub.get(
      `tariff-offers:detail-${id}`,
      () => this.http.get<TariffOffer>(`${this.baseUrl}/${id}`),
      { dataType: DataType.BUSINESS }
    );
  }

  // Keep legacy method for backward compatibility
  getTariffOffer(id: string): Observable<TariffOffer> {
    return this.getTariffOfferById(id);
  }

  createTariffOffer(request: CreateTariffOfferRequest): Observable<TariffOffer> {
    return this.http.post<TariffOffer>(this.baseUrl, request).pipe(
      tap(() => {
        // Invalidate all caches after creation
        this.cacheHub.invalidatePattern('tariff-offers:');
      })
    );
  }

  updateTariffOffer(id: string, request: UpdateTariffOfferRequest): Observable<TariffOffer> {
    return this.http.put<TariffOffer>(`${this.baseUrl}/${id}`, request).pipe(
      tap(() => {
        // Invalidate all caches after update
        this.cacheHub.invalidatePattern('tariff-offers:');
      })
    );
  }

  deleteTariffOffer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        // Invalidate all caches after deletion
        this.cacheHub.invalidatePattern('tariff-offers:');
      })
    );
  }

  /**
   * Get active tariff offers for a specific product or all if no productId provided
   */
  getActiveTariffOffers(productId?: string): Observable<ActiveTariffOffer[]> {
    let params = new HttpParams();
    
    // Only add productId param if it's provided
    if (productId) {
      params = params.set('productId', productId);
    }
    
    // Generate cache key based on productId
    const cacheKey = productId 
      ? `tariff-offers:active-${productId}`
      : 'tariff-offers:active-all';

    return this.cacheHub.get(
      cacheKey,
      () => this.http.get<ActiveTariffOffer[]>(`${this.baseUrl}/active`, { params }),
      { dataType: DataType.BUSINESS }
    );
  }
}