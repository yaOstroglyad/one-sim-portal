// Common models following product-constructor pattern
import { TicketStatus, TicketPriority, TicketCategory } from './ticket.model';
// Re-export shared pagination types for backward compatibility
import { PageRequest as PageRequestType } from '@shared/models/core';
export { PageRequest, PageResponse } from '@shared/models/core';

export interface TicketSearchRequest {
  searchParams: {
    status?: TicketStatus[];
    priority?: TicketPriority[];
    category?: TicketCategory[];
    assignedToId?: string;
    search?: string;
    accountId?: string;
  };
  page: PageRequestType;
}


// API response types
export interface TicketCount {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  cancelled: number;
}