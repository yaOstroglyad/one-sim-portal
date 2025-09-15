// Common models following product-constructor pattern
import { TicketStatus, TicketPriority, TicketCategory } from './ticket.model';

export interface TicketSearchRequest {
  searchParams: {
    status?: TicketStatus[];
    priority?: TicketPriority[];
    category?: TicketCategory[];
    assignedToId?: string;
    search?: string;
    accountId?: string;
  };
  page: PageRequest;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  number: number;
  size: number;
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