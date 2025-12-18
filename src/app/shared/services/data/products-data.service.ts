import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Package } from '@shared/models/product';
import { DataService } from '../core';
import { map } from 'rxjs/operators';
import { Pagination } from '@shared/models/ui';
import { CacheHubService, DataType } from '../cache-hub';
import { handleArrayError, handleEmptyObjectError } from '../../utils';

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
			handleArrayError('fetching products')
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
			handleArrayError('fetching filtered products')
		);
	}

	/**
	 * @deprecated Use ProductService.createProduct() instead
	 */
	create(product: any): Observable<any> {
		return this.http.post<any>(`/api/v1/products/command/create`, product).pipe(
			handleArrayError('creating product')
		);
	}

	/**
	 * @deprecated Use ProductService.updateProduct() instead
	 */
	update(product: any): Observable<any> {
		return this.http.patch<any>(`/api/v1/products/command/update`, product).pipe(
			handleArrayError('updating product')
		);
	}

	/**
	 * @deprecated Use ProductService.updateProductStatus() instead
	 */
	updateStatus(changeStatus: any): Observable<any> {
		return this.http.patch<any>(`/api/v1/products/command/update-status`, changeStatus).pipe(
			handleArrayError('updating product status')
		);
	}

	/**
	 * @deprecated This method is deprecated
	 */
	getStatuses(): Observable<string[]> {
		return this.http.get<any>(`/api/v1/products/statuses`).pipe(
			handleArrayError('fetching product statuses')
		);
	}

	getCurrencies(): Observable<string[]> {
		return this.cacheHub.get(
			'currencies:all-currencies',
			() => this.http.get<string[]>(`/api-product/api/v1/esim-product/common/currency`).pipe(
				handleArrayError('fetching currencies')
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
					'USD': 1.0,      // базовая валюта
					'EUR': 0.868,     // USD → EUR (1 USD ≈ 0.868 EUR) :contentReference[oaicite:0]{index=0}
					'GBP': 0.79,      // без точных свежих данных, оставлено прежнее
					'JPY': 154.4,     // USD → JPY около 154.4 :contentReference[oaicite:1]{index=1}
					'CAD': 1.40,      // USD → CAD около 1.400 :contentReference[oaicite:2]{index=2}
					'AUD': 0.6549,    // USD → AUD ≈ 0.6549 :contentReference[oaicite:3]{index=3}
					'CHF': 0.7933,    // USD → CHF ≈ 0.7933 :contentReference[oaicite:4]{index=4}
					'CNY': 7.10,      // USD → CNY ≈ 7.10 :contentReference[oaicite:5]{index=5}
					'SEK': 9.4485,    // USD → SEK ≈ 9.4485 :contentReference[oaicite:6]{index=6}
					'NOK': 10.0932,   // USD → NOK ≈10.0932 :contentReference[oaicite:7]{index=7}
					'DKK': 6.4280,    // USD → DKK ≈6.4280 :contentReference[oaicite:8]{index=8}
					'PLN': 4.05,      // без точных свежих данных — оставлено прежнее
					'CZK': 23.50,     // без точных свежих данных — прежний
					'HUF': 385.0,     // без точных свежих данных
					'RUB': 95.0,      // без точных свежих данных
					'UAH': 41.0,      // без точных свежих данных
					'ILS': 3.285,     // USD → ILS ≈ 3.285 :contentReference[oaicite:9]{index=9}
					'TRY': 34.0,      // без точных свежих данных
					'INR': 88.64,     // USD → INR ≈ 88.64 :contentReference[oaicite:10]{index=10}
					'BRL': 5.29,      // USD → BRL ≈ 5.29 (из H.10: 5.2858 на 12 ноября) :contentReference[oaicite:11]{index=11}
					'KRW': 1453.2,    // USD → KRW ≈ 1453.2 :contentReference[oaicite:12]{index=12}
					'SGD': 1.2984,    // USD → SGD ≈ 1.2984 :contentReference[oaicite:13]{index=13}
					'HKD': 7.7716,    // USD → HKD ≈ 7.7716 :contentReference[oaicite:14]{index=14}
					'NZD': 0.5685,    // USD → NZD ≈ 0.5685 :contentReference[oaicite:15]{index=15}
					'MXN': 18.33,     // USD → MXN ≈ 18.3299 :contentReference[oaicite:16]{index=16}
					'ZAR': 17.1235,   // USD → ZAR ≈ 17.1235 :contentReference[oaicite:17]{index=17}
					'THB': 32.42,     // USD → THB ≈ 32.4200 :contentReference[oaicite:18]{index=18}
					'MYR': 4.13,      // USD → MYR ≈ 4.13 :contentReference[oaicite:19]{index=19}
					'IDR': 15800.0,   // без точных свежих данных
					'PHP': 57.0,      // без точных свежих данных
					'VND': 24500.0    // без точных свежих данных
				};

				return of(mockExchangeRates);
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
			handleEmptyObjectError('fetching product template')
		);
	}

	/**
	 * @deprecated This method is deprecated
	 */
	getParentProducts(): Observable<any> {
		return this.http.get<any>(`/api/v1/products/query/parent`).pipe(
			handleEmptyObjectError('fetching parent products')
		);
	}

}
