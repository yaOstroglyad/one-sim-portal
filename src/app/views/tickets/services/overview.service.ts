import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  TicketStats
} from '../models';
import { TicketCount } from '../models';
import { CacheHubService, DataType } from '@shared/services/cache-hub';
import { MockedService } from '@shared/decorators/mock.decorator';

@Injectable({
  providedIn: 'root'
})
@MockedService({
  endpoints: ['getTicketStats', 'getTicketCount']
})
export class OverviewService {
  private readonly baseUrl = '/api-tickets/api/v1/tickets';

  constructor(
    private http: HttpClient,
    private cacheHub: CacheHubService
  ) {}

  getTicketStats(accountId?: string): Observable<TicketStats> {
    console.log('[OverviewService] getTicketStats() called with accountId:', accountId);
    console.log('[OverviewService] Base URL:', this.baseUrl);
    
    const params: any = {};
    if (accountId) {
      params.accountId = accountId;
    }
    
    const url = `${this.baseUrl}/stats`;
    console.log('[OverviewService] Full URL:', url, 'Params:', params);
    
    const cacheKey = accountId ? `tickets:stats:${accountId}` : 'tickets:stats';
    
    const observable = this.cacheHub.get(
      cacheKey,
      () => {
        console.log('[OverviewService] Cache miss - making HTTP request');
        return this.http.get<TicketStats>(url, { params });
      },
      { dataType: DataType.BUSINESS, ttl: 5 * 60 * 1000 } // 5 minutes cache
    );
    
    console.log('[OverviewService] Returning observable:', !!observable);
    return observable;
  }

  getTicketCount(): Observable<TicketCount> {
    return this.cacheHub.get(
      'tickets:count',
      () => this.http.get<TicketCount>(`${this.baseUrl}/count`),
      { dataType: DataType.BUSINESS, ttl: 2 * 60 * 1000 } // 2 minutes cache
    );
  }
}