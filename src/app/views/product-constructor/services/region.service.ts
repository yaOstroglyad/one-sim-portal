import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Region, RegionSummary, CreateRegionRequest, UpdateRegionRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private readonly baseUrl = '/api-product/api/v1/esim-product/regions';

  constructor(private http: HttpClient) {}

  getRegions(): Observable<RegionSummary[]> {
    return this.http.get<RegionSummary[]>(this.baseUrl);
  }

  getRegion(id: number): Observable<Region> {
    return this.http.get<Region>(`${this.baseUrl}/${id}`);
  }

  createRegion(request: CreateRegionRequest): Observable<any> {
    return this.http.post(this.baseUrl, request);
  }

  updateRegion(id: number, request: UpdateRegionRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request);
  }

  deleteRegion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
