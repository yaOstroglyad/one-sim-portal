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
  // Customer information
  iccid?: string;
  customerEmail?: string;
  customerName?: string;
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
  iccid?: string;
  customerEmail?: string;
  customerName?: string;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string;
  subject?: string;
  description?: string;
}

// Comment from API
export interface TicketComment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

// Attachment from API
export interface TicketAttachment {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  ticketId: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  s3Key: string;
}

// Create Comment Request
export interface CreateTicketCommentRequest {
  content: string;
  isInternal?: boolean;
}

// Download URL Response
export interface DownloadUrlResponse {
  url: string;
}

