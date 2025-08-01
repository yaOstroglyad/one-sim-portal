import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  CreateTariffOfferRequest, 
  UpdateTariffOfferRequest,
  TariffOffer, 
  TariffOfferSearchRequest 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TariffOfferService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/tariff-offers';

  constructor(private http: HttpClient) {}

  getTariffOffers(searchRequest?: TariffOfferSearchRequest): Observable<TariffOffer[]> {
    let params = new HttpParams();
    
    if (searchRequest) {
      // Add search parameters
      if (searchRequest.searchParams.productId) {
        params = params.set('productId', searchRequest.searchParams.productId);
      }
      if (searchRequest.searchParams.providerProductId) {
        params = params.set('providerProductId', searchRequest.searchParams.providerProductId);
      }
      if (searchRequest.searchParams.currency) {
        params = params.set('currency', searchRequest.searchParams.currency);
      }
      
      // Add pagination parameters
      if (searchRequest.page.page !== undefined) {
        params = params.set('page', searchRequest.page.page.toString());
      }
      if (searchRequest.page.size !== undefined) {
        params = params.set('size', searchRequest.page.size.toString());
      }
      if (searchRequest.page.sort) {
        // Handle sort as array - join with comma if needed
        const sortValue = Array.isArray(searchRequest.page.sort) 
          ? searchRequest.page.sort.join(',')
          : searchRequest.page.sort;
        params = params.set('sort', sortValue);
      }
    }

    return this.http.get<TariffOffer[]>(this.baseUrl, { params });
  }

  getTariffOfferById(id: string): Observable<TariffOffer> {
    return this.http.get<TariffOffer>(`${this.baseUrl}/${id}`);
  }

  // Keep legacy method for backward compatibility
  getTariffOffer(id: string): Observable<TariffOffer> {
    return this.getTariffOfferById(id);
  }

  createTariffOffer(request: CreateTariffOfferRequest): Observable<TariffOffer> {
    return this.http.post<TariffOffer>(this.baseUrl, request);
  }

  updateTariffOffer(id: string, request: UpdateTariffOfferRequest): Observable<TariffOffer> {
    return this.http.put<TariffOffer>(`${this.baseUrl}/${id}`, request);
  }

  deleteTariffOffer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}