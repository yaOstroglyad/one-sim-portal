import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../model';
import { CacheHubService, DataType } from './cache-hub';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);
  private readonly baseUrl = '/api-product/api/v1/esim-product/countries';

  /**
   * Get all countries with intelligent caching
   * Countries are static data that rarely changes, so we cache for 24 hours
   */
  getCountries(): Observable<Country[]> {
    return this.cacheHub.get(
      'countries:all-countries',
      () => this.http.get<Country[]>(this.baseUrl),
      {
        dataType: DataType.STATIC,
        ttl: 24 * 60 * 60 * 1000 // 24 hours - countries don't change often
      }
    );
  }

  /**
   * Get select options for dropdowns (optimized for form usage)
   */
  getCountryOptions(): Observable<Array<{ value: string; label: string; data: Country }>> {
    return this.cacheHub.get(
      'countries:country-options', // Manual namespace prefix
      () => this.http.get<Country[]>(this.baseUrl).pipe(
        // Transform to select options format
        map((countries: Country[]) =>
          countries.map(country => ({
            value: country.isoAlphaCode2,
            label: country.name,
            data: country
          }))
        )
      ),
      {
        dataType: DataType.STATIC,
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      }
    );
  }

  /**
   * Get specific country by code (cached individually)
   */
  getCountryByCode(code: string): Observable<Country | null> {
    return this.cacheHub.get(
      `countries:country-${code}`, // Manual namespace prefix
      () => this.http.get<Country>(`${this.baseUrl}/${code}`),
      {
        dataType: DataType.STATIC,
        ttl: 24 * 60 * 60 * 1000
      }
    );
  }

  /**
   * Preload countries data for better UX
   */
  preloadCountries(): void {
    this.cacheHub.preload(
      'countries:all-countries',
      () => this.http.get<Country[]>(this.baseUrl),
      { dataType: DataType.STATIC }
    );
  }

}
