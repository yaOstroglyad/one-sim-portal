import { Injectable, signal } from '@angular/core';
import { Ticket } from '../models';

export interface TicketEvent<T = any> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketEventService {
  // Signal-based events
  private ticketCreatedSignal = signal<TicketEvent<Ticket> | null>(null);
  private ticketUpdatedSignal = signal<TicketEvent<Ticket> | null>(null);
  private applyFiltersSignal = signal<TicketEvent<any> | null>(null);
  private refreshListSignal = signal<number>(0);

  // Public readonly signals
  readonly ticketCreated = this.ticketCreatedSignal.asReadonly();
  readonly ticketUpdated = this.ticketUpdatedSignal.asReadonly();
  readonly applyFilters = this.applyFiltersSignal.asReadonly();
  readonly refreshListTrigger = this.refreshListSignal.asReadonly();

  // Emit when a new ticket is created
  emitTicketCreated(ticket: Ticket): void {
    this.ticketCreatedSignal.set({ data: ticket, timestamp: Date.now() });
    this.emitRefreshList();
  }

  // Emit when a ticket is updated
  emitTicketUpdated(ticket: Ticket): void {
    this.ticketUpdatedSignal.set({ data: ticket, timestamp: Date.now() });
    this.emitRefreshList();
  }

  // Apply filters from external sources (like quick actions)
  emitApplyFilters(filters: any): void {
    this.applyFiltersSignal.set({ data: filters, timestamp: Date.now() });
  }

  // Request list refresh
  emitRefreshList(): void {
    this.refreshListSignal.update(v => v + 1);
  }
}
