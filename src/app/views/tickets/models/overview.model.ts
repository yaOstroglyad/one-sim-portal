// Overview/dashboard specific models

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTime: number; // in hours
  ticketsTodayCount: number;
  ticketsThisWeekCount: number;
  ticketsThisMonthCount: number;
}

// Quick action interfaces for overview page
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  action?: string;
  queryParams?: Record<string, any>;
}