import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { 
  CompanyProduct,
  CreateCompanyProductRequest,
  UpdateCompanyProductRequest,
  CompanyProductStatusRequest,
  CompanyProductSearchRequest,
  PageResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CompanyProductService {
  private readonly apiUrl = '/api-product/api/v1/esim-product/company-products';

  constructor(private http: HttpClient) {}

  searchCompanyProducts(request: CompanyProductSearchRequest): Observable<PageResponse<CompanyProduct>> {
    // TODO: Implement actual API call when backend is ready
    const mockResponse: PageResponse<CompanyProduct> = {
      totalElements: 2,
      totalPages: 1,
      size: 10,
      content: this.getMockCompanyProducts(),
      number: 0,
      sort: { sorted: false, empty: true, unsorted: true },
      numberOfElements: 2,
      pageable: {
        offset: 0,
        sort: { sorted: false, empty: true, unsorted: true },
        pageSize: 10,
        pageNumber: 0,
        paged: true,
        unpaged: false
      },
      first: true,
      last: true,
      empty: false
    };
    
    return of(mockResponse).pipe(delay(500));
  }

  getCompanyProducts(): Observable<CompanyProduct[]> {
    // TODO: Implement actual API call when backend is ready
    return of(this.getMockCompanyProducts()).pipe(delay(500));
  }

  getCompanyProduct(id: string): Observable<CompanyProduct> {
    // TODO: Implement actual API call when backend is ready
    const mockProduct = this.getMockCompanyProducts().find(p => p.id === id);
    if (mockProduct) {
      return of(mockProduct).pipe(delay(300));
    }
    throw new Error('Company product not found');
  }

  createCompanyProduct(request: CreateCompanyProductRequest): Observable<CompanyProduct> {
    // TODO: Implement actual API call when backend is ready
    const newProduct: CompanyProduct = {
      id: Date.now().toString(),
      company: {
        id: request.companyId,
        name: 'Mock Company',
        accountId: 'account-123'
      },
      name: 'New Company Product',
      description: request.description || '',
      serviceCoverage: {
        id: 1,
        name: 'Global',
        type: 'REGION'
      },
      price: 99.99,
      currency: 'USD',
      usageUnits: [
        { value: 10, type: 'data', unitType: 'GB' }
      ],
      validityPeriod: {
        period: 30,
        timeUnit: 'days'
      },
      active: true
    };
    
    return of(newProduct).pipe(delay(500));
  }

  updateCompanyProduct(id: string, request: UpdateCompanyProductRequest): Observable<CompanyProduct> {
    // TODO: Implement actual API call when backend is ready
    const existingProduct = this.getMockCompanyProducts().find(p => p.id === id);
    if (existingProduct) {
      const updatedProduct = {
        ...existingProduct,
        description: request.description || existingProduct.description,
        validityPeriod: request.validityPeriod || existingProduct.validityPeriod
      };
      return of(updatedProduct).pipe(delay(500));
    }
    throw new Error('Company product not found');
  }

  updateCompanyProductStatus(id: string, request: CompanyProductStatusRequest): Observable<void> {
    // TODO: Implement actual API call when backend is ready
    console.log(`Updating company product ${id} status to:`, request.isActive);
    return of(undefined).pipe(delay(300));
  }

  deleteCompanyProduct(id: string): Observable<void> {
    // TODO: Implement actual API call when backend is ready
    console.log(`Deleting company product with id: ${id}`);
    return of(undefined).pipe(delay(300));
  }

  // Mock data
  private getMockCompanyProducts(): CompanyProduct[] {
    return [
      {
        id: '1',
        company: {
          id: 'company-1',
          name: 'TechCorp Solutions',
          accountId: 'account-tech-1'
        },
        name: 'Premium Europe Data Plan',
        description: 'High-speed data plan optimized for European business travelers',
        serviceCoverage: {
          id: 1,
          name: 'Europe',
          type: 'REGION'
        },
        price: 149.99,
        currency: 'EUR',
        usageUnits: [
          { value: 20, type: 'data', unitType: 'GB' },
          { value: 500, type: 'voice', unitType: 'Minutes' },
          { value: 100, type: 'sms', unitType: 'Messages' }
        ],
        validityPeriod: {
          period: 30,
          timeUnit: 'days'
        },
        active: true
      },
      {
        id: '2',
        company: {
          id: 'company-2',
          name: 'Global Enterprises Inc',
          accountId: 'account-global-1'
        },
        name: 'US Business Essential',
        description: 'Essential connectivity package for US-based operations',
        serviceCoverage: {
          id: 2,
          name: 'United States',
          type: 'COUNTRY'
        },
        price: 89.99,
        currency: 'USD',
        usageUnits: [
          { value: 10, type: 'data', unitType: 'GB' },
          { value: -1, type: 'voice', unitType: 'Minutes' }, // -1 represents unlimited
          { value: -1, type: 'sms', unitType: 'Messages' } // -1 represents unlimited
        ],
        validityPeriod: {
          period: 30,
          timeUnit: 'days'
        },
        active: false
      }
    ];
  }
}