import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketSearchRequest,
  PageResponse,
  TicketStatus
} from '../models';
import { CacheHubService, DataType } from '@shared/services/cache-hub';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly baseUrl = '/api-tickets/api/v1/tickets';

  constructor(
    private http: HttpClient,
    private cacheHub: CacheHubService
  ) {}

  getTickets(searchRequest: TicketSearchRequest): Observable<PageResponse<Ticket>> {
    let params = new HttpParams()
      .set('page', searchRequest.page.page.toString())
      .set('size', searchRequest.page.size.toString());

    // Add sort parameters if provided
    if (searchRequest.page.sort?.length) {
      params = params.set('sort', searchRequest.page.sort.join(','));
    }

    // Add search parameters
    Object.entries(searchRequest.searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params = params.set(key, value.join(','));
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    // For overview/dashboard requests, use cache
    if (this.isOverviewRequest(searchRequest)) {
      return this.cacheHub.get(
        'tickets:overview',
        () => this.http.get<PageResponse<Ticket>>(this.baseUrl, { params }),
        { dataType: DataType.BUSINESS }
      ).pipe(
        map(response => {
          // If cache returns null or invalid response, make direct HTTP call
          if (!response || !response.content || !Array.isArray(response.content)) {
            console.log('Cache returned invalid data, will fallback to direct HTTP');
            throw new Error('Invalid cache data');
          }
          return response;
        }),
        catchError(error => {
          console.log('Cache error or invalid data, falling back to direct HTTP call:', error.message);
          return this.http.get<PageResponse<Ticket>>(this.baseUrl, { params });
        })
      );
    }

    return this.http.get<PageResponse<Ticket>>(this.baseUrl, { params });
  }

  private isOverviewRequest(searchRequest: TicketSearchRequest): boolean {
    // Check if this is a request for overview data (recent tickets, etc.)
    return searchRequest.page.size <= 20 &&
           !searchRequest.searchParams.status &&
           !searchRequest.searchParams.priority &&
           !searchRequest.searchParams.category &&
           !searchRequest.searchParams.assignedToId &&
           !searchRequest.searchParams.search;
  }

  getTicket(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  createTicket(request: CreateTicketRequest): Observable<any> {
    return this.http.post(this.baseUrl, request).pipe(
      tap(() => {
        // Invalidate tickets cache after creation
        this.cacheHub.invalidate('tickets:overview');
        this.cacheHub.invalidate('tickets:stats');
      })
    );
  }

  updateTicket(id: string, request: UpdateTicketRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request).pipe(
      tap(() => {
        // Invalidate tickets cache after update
        this.cacheHub.invalidate('tickets:overview');
        this.cacheHub.invalidate('tickets:stats');
      })
    );
  }

  updateTicketStatus(id: string, status: TicketStatus): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, { status }).pipe(
      tap(() => {
        // Invalidate tickets cache after status update
        this.cacheHub.invalidate('tickets:overview');
        this.cacheHub.invalidate('tickets:stats');
      })
    );
  }
}