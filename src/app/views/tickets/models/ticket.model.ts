// Core ticket domain models
export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdById: string;
  createdByName: string;
  assignedToId?: string;
  assignedToName?: string;
  companyId: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  commentsCount: number;
  attachmentsCount: number;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 
  | 'GENERAL_INQUIRY' 
  | 'TECHNICAL_ISSUE' 
  | 'BILLING_QUESTION'
  | 'FEATURE_REQUEST' 
  | 'BUG_REPORT' 
  | 'ACCOUNT_ISSUE' 
  | 'INTEGRATION_SUPPORT'
  | 'PERFORMANCE_ISSUE' 
  | 'SECURITY_CONCERN' 
  | 'DATA_REQUEST' 
  | 'COMPLIANCE_INQUIRY' 
  | 'OTHER';


export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string;
  subject?: string;
  description?: string;
}

