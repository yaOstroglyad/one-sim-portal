import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Region, RegionSummary, CreateRegionRequest, UpdateRegionRequest } from '../models';
import { CacheHubService, DataType } from '../../../shared/services/cache-hub';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/regions';

  constructor(
    private http: HttpClient,
    private cacheHub: CacheHubService
  ) {}

  getRegions(): Observable<RegionSummary[]> {
    return this.cacheHub.get(
      'regions:list',
      () => this.http.get<RegionSummary[]>(this.baseUrl),
      { dataType: DataType.BUSINESS }
    );
  }

  getRegion(id: number): Observable<Region> {
    return this.cacheHub.get(
      `regions:detail-${id}`,
      () => this.http.get<Region>(`${this.baseUrl}/${id}`),
      { dataType: DataType.BUSINESS }
    );
  }

  createRegion(request: CreateRegionRequest): Observable<any> {
    return this.http.post(this.baseUrl, request).pipe(
      tap(() => {
        // Invalidate regions list cache after creation
        this.cacheHub.invalidate('regions:list');
      })
    );
  }

  updateRegion(id: number, request: UpdateRegionRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request).pipe(
      tap(() => {
        // Invalidate both list and specific region cache after update
        this.cacheHub.invalidate('regions:list');
        this.cacheHub.invalidate(`regions:detail-${id}`);
      })
    );
  }

  deleteRegion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        // Invalidate both list and specific region cache after deletion
        this.cacheHub.invalidate('regions:list');
        this.cacheHub.invalidate(`regions:detail-${id}`);
      })
    );
  }

}
