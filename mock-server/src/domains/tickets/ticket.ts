// Ticket domain model and related interfaces based on OpenAPI specification

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

// Full ticket model (for GET /tickets/{id})
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

// Simplified ticket model for list views
export interface TicketListItem {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdByName: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

// Create ticket request
export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}

// Update ticket request
export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string;
  subject?: string;
  description?: string;
}

// Get tickets query parameters
export interface GetTicketsParams {
  page?: string;
  size?: string;
  sort?: string[];
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
}

// Get recent tickets parameters
export interface GetRecentTicketsParams {
  limit?: string;
}

// Get all company tickets parameters
export interface GetAllCompanyTicketsParams {
  companyId: string;
  page?: string;
  size?: string;
  sort?: string[];
}

// Ticket count response
export interface TicketCount {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  cancelled: number;
}

// Comment model
export interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

// Create comment request
export interface CreateCommentRequest {
  content: string;
  isInternal: boolean;
}

// Attachment model
export interface Attachment {
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

// Upload attachment request
export interface UploadAttachmentRequest {
  file: string; // base64 or file path in mock
}