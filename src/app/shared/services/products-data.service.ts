import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Package } from '../model/package';
import { DataService } from '../../shared';
import { map } from 'rxjs/operators';
import { Pagination } from '../model/grid-configs';
import { CacheHubService, DataType } from './cache-hub';

@Injectable({
	providedIn: 'root'
})
export class ProductsDataService extends DataService<Package> {
	private apiUrl = '/api/v1/products/query/all';
	private readonly cacheHub = inject(CacheHubService);

	constructor(public http: HttpClient) {
		super(http, '/api/v1/products');
	}

	/**
	 * @deprecated Use ProductService.getProducts() instead
	 */
	list(): Observable<Package[]> {
		return this.http.get<Package[]>(this.apiUrl).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	/**
	 * @deprecated Use ProductService.getProducts() instead
	 */
	listFiltered(params: {
		serviceProviderId: string;
		customerId?: string;
		page?: number;
		size?: number;
		sort?: string[];
	}): Observable<Package[]> {
		const queryParams: any = {
			serviceProviderId: params.serviceProviderId,
			...(params.customerId && { customerId: params.customerId }),
			page: params.page ?? 0,
			size: params.size ?? 200,
			...(params.sort?.length ? { sort: params.sort } : {})
		};

		return this.http.get<Pagination<Package>>('/api/v1/products/query/available', {
			params: queryParams
		}).pipe(
			map(e => e?.content),
			catchError(() => {
				console.warn('Error occurred, returning mocked data');
				return of([]);
			})
		);
	}

	/**
	 * @deprecated Use ProductService.createProduct() instead
	 */
	create(product: any): Observable<any> {
		return this.http.post<any>(`/api/v1/products/command/create`, product).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of([]);
			})
		);
	}

	/**
	 * @deprecated Use ProductService.updateProduct() instead
	 */
	update(product: any): Observable<any> {
		return this.http.patch<any>(`/api/v1/products/command/update`, product).pipe(
			catchError(() => {
				console.warn('error happened, cant update');
				return of([]);
			})
		);
	}

	/**
	 * @deprecated Use ProductService.updateProductStatus() instead
	 */
	updateStatus(changeStatus: any): Observable<any> {
		return this.http.patch<any>(`/api/v1/products/command/update-status`, changeStatus).pipe(
			catchError(() => {
				console.warn('error happened, cant update status');
				return of([]);
			})
		);
	}

	/**
	 * @deprecated This method is deprecated
	 */
	getStatuses(): Observable<string[]> {
		return this.http.get<any>(`/api/v1/products/statuses`).pipe(
			catchError(() => {
				console.warn('error happened, cant get statuses');
				return of([]);
			})
		);
	}

	getCurrencies(): Observable<string[]> {
		return this.cacheHub.get(
			'currencies:all-currencies',
			() => this.http.get<string[]>(`/api-product/api/v1/esim-product/common/currency`).pipe(
				catchError(() => {
					console.warn('error happened, presenting mocked data');
					return of([]);
				})
			),
			{
				dataType: DataType.REFERENCE,
				ttl: 24 * 60 * 60 * 1000 // 24 hours - currencies don't change often
			}
		);
	}

	/**
	 * Get currency exchange rates (mock data with current rates as of today)
	 * In production, this should fetch from a real exchange rate API
	 */
	getExchangeRates(): Observable<Record<string, number>> {
		return this.cacheHub.get(
			'exchange-rates:all-rates',
			() => {
				// Mock data with current exchange rates (December 2024)
				// Base currency: USD
				const mockExchangeRates: Record<string, number> = {
					'USD': 1.0,      // Base currency
					'EUR': 0.93,     // US Dollar to Euro
					'GBP': 0.79,     // US Dollar to British Pound
					'JPY': 149.50,   // US Dollar to Japanese Yen
					'CAD': 1.39,     // US Dollar to Canadian Dollar
					'AUD': 1.52,     // US Dollar to Australian Dollar
					'CHF': 0.88,     // US Dollar to Swiss Franc
					'CNY': 7.25,     // US Dollar to Chinese Yuan
					'SEK': 10.85,    // US Dollar to Swedish Krona
					'NOK': 11.15,    // US Dollar to Norwegian Krone
					'DKK': 6.95,     // US Dollar to Danish Krone
					'PLN': 4.05,     // US Dollar to Polish Zloty
					'CZK': 23.50,    // US Dollar to Czech Koruna
					'HUF': 385.0,    // US Dollar to Hungarian Forint
					'RUB': 95.0,     // US Dollar to Russian Ruble
					'UAH': 41.0,     // US Dollar to Ukrainian Hryvnia
					'ILS': 3.65,     // US Dollar to Israeli Shekel
					'TRY': 34.0,     // US Dollar to Turkish Lira
					'INR': 84.0,     // US Dollar to Indian Rupee
					'BRL': 6.10,     // US Dollar to Brazilian Real
					'KRW': 1380.0,   // US Dollar to South Korean Won
					'SGD': 1.35,     // US Dollar to Singapore Dollar
					'HKD': 7.80,     // US Dollar to Hong Kong Dollar
					'NZD': 1.67,     // US Dollar to New Zealand Dollar
					'MXN': 20.15,    // US Dollar to Mexican Peso
					'ZAR': 18.50,    // US Dollar to South African Rand
					'THB': 35.0,     // US Dollar to Thai Baht
					'MYR': 4.48,     // US Dollar to Malaysian Ringgit
					'IDR': 15800.0,  // US Dollar to Indonesian Rupiah
					'PHP': 57.0,     // US Dollar to Philippine Peso
					'VND': 24500.0   // US Dollar to Vietnamese Dong
				};

				return of(mockExchangeRates).pipe(
					catchError(() => {
						console.warn('Error getting exchange rates, using fallback USD rates');
						return of({ 'USD': 1.0 });
					})
				);
			},
			{
				dataType: DataType.REFERENCE,
				ttl: 60 * 60 * 1000 // 1 hour - exchange rates change frequently
			}
		);
	}

	/**
	 * @deprecated This method is deprecated
	 */
	getProductTemplate(params: any): Observable<any> {
		return this.http.get<any>(`/api/v1/products/command/template`, {params}).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of({});
			})
		);
	}

	/**
	 * @deprecated This method is deprecated
	 */
	getParentProducts(): Observable<any> {
		return this.http.get<any>(`/api/v1/products/query/parent`).pipe(
			catchError(() => {
				console.warn('error happened, presenting mocked data');
				return of({});
			})
		);
	}

}
