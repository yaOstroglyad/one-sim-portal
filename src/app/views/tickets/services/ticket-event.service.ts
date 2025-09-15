import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Ticket } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TicketEventService {
  // Event emitted when a new ticket is created
  private ticketCreatedSource = new Subject<Ticket>();
  ticketCreated$ = this.ticketCreatedSource.asObservable();

  // Event emitted when a ticket is updated
  private ticketUpdatedSource = new Subject<Ticket>();
  ticketUpdated$ = this.ticketUpdatedSource.asObservable();

  // Event emitted when filters should be applied
  private applyFiltersSource = new Subject<any>();
  applyFilters$ = this.applyFiltersSource.asObservable();

  // Event emitted to refresh ticket list
  private refreshListSource = new Subject<void>();
  refreshList$ = this.refreshListSource.asObservable();

  constructor() {}

  // Emit when a new ticket is created
  emitTicketCreated(ticket: Ticket): void {
    console.log('[TicketEventService] Ticket created:', ticket);
    this.ticketCreatedSource.next(ticket);
    this.refreshListSource.next(); // Also trigger list refresh
  }

  // Emit when a ticket is updated
  emitTicketUpdated(ticket: Ticket): void {
    console.log('[TicketEventService] Ticket updated:', ticket);
    this.ticketUpdatedSource.next(ticket);
    this.refreshListSource.next(); // Also trigger list refresh
  }

  // Apply filters from external sources (like quick actions)
  emitApplyFilters(filters: any): void {
    console.log('[TicketEventService] Apply filters:', filters);
    this.applyFiltersSource.next(filters);
  }

  // Request list refresh
  emitRefreshList(): void {
    console.log('[TicketEventService] Refresh list requested');
    this.refreshListSource.next();
  }
}