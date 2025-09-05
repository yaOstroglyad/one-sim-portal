import * as fs from 'fs';
import * as path from 'path';
import { PaginatedResponse, ServiceError } from '../../types';
import { 
  Ticket, 
  TicketListItem, 
  CreateTicketRequest, 
  UpdateTicketRequest,
  GetTicketsParams,
  GetRecentTicketsParams,
  GetAllCompanyTicketsParams,
  TicketCount,
  Comment,
  CreateCommentRequest,
  Attachment,
  UploadAttachmentRequest 
} from './ticket';

interface TicketsListData {
  content: TicketListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export class TicketsService {
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/tickets');
  }

  // Helper function to read JSON data
  private readJsonFile<T>(filename: string): T {
    try {
      const filePath = path.join(this.dataPath, filename);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      throw new ServiceError(`Failed to load ${filename}`, 500);
    }
  }

  // GET /api/v1/tickets - Get paginated tickets with filtering
  public getTickets(params: GetTicketsParams): PaginatedResponse<TicketListItem> {
    const page = parseInt(params.page || '0');
    const size = parseInt(params.size || '20');
    const sort = params.sort;
    
    const allTickets = this.readJsonFile<TicketsListData>('list.json');
    
    // Simple pagination
    const start = page * size;
    const end = start + size;
    let filteredContent = allTickets.content;
    
    // Apply filters
    if (params.status) {
      filteredContent = filteredContent.filter(t => t.status === params.status);
    }
    
    if (params.priority) {
      filteredContent = filteredContent.filter(t => t.priority === params.priority);
    }
    
    if (params.category) {
      filteredContent = filteredContent.filter(t => t.category === params.category);
    }
    
    // Apply pagination after filtering
    const paginatedContent = filteredContent.slice(start, end);
    
    return {
      content: paginatedContent,
      totalElements: filteredContent.length,
      totalPages: Math.ceil(filteredContent.length / size),
      number: page,
      size: size,
      sort: {
        sorted: !!sort,
        unsorted: !sort,
        empty: !sort
      },
      first: page === 0,
      last: page >= Math.ceil(filteredContent.length / size) - 1,
      numberOfElements: paginatedContent.length,
      empty: paginatedContent.length === 0
    };
  }

  // POST /api/v1/tickets - Create a new ticket
  public createTicket(ticketData: CreateTicketRequest): Ticket {
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: `TK-${Date.now().toString().slice(-6)}`,
      subject: ticketData.subject,
      description: ticketData.description,
      status: 'OPEN',
      priority: ticketData.priority,
      category: ticketData.category,
      createdById: 'user-mock-123',
      createdByName: 'Mock User',
      companyId: 'company-mock-456',
      companyName: 'Mock Company Inc.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentsCount: 0,
      attachmentsCount: 0
    };
    
    console.log('[MOCK] Created ticket:', newTicket);
    return newTicket;
  }

  // GET /api/v1/tickets/{id} - Get ticket by ID
  public getTicketById(id: string): Ticket {
    const tickets = this.readJsonFile<{ tickets: Ticket[] }>('details.json');
    const ticket = tickets.tickets.find(t => t.id === id);
    
    if (!ticket) {
      throw new ServiceError('Ticket not found', 404);
    }
    
    return ticket;
  }

  // PATCH /api/v1/tickets/{id} - Update ticket
  public updateTicket(id: string, updateData: UpdateTicketRequest): Ticket {
    const ticket = this.getTicketById(id); // This will throw if not found
    
    const updatedTicket: Ticket = {
      ...ticket,
      ...updateData,
      updatedAt: new Date().toISOString(),
      // Set resolved/closed timestamps based on status
      resolvedAt: updateData.status === 'RESOLVED' ? new Date().toISOString() : ticket.resolvedAt,
      closedAt: updateData.status === 'CLOSED' ? new Date().toISOString() : ticket.closedAt
    };
    
    console.log('[MOCK] Updated ticket:', updatedTicket);
    return updatedTicket;
  }

  // DELETE /api/v1/tickets/{id} - Delete ticket (soft delete)
  public deleteTicket(id: string): void {
    const ticket = this.getTicketById(id); // This will throw if not found
    console.log('[MOCK] Deleted ticket:', id);
  }

  // GET /api/v1/tickets/recent - Get recent tickets
  public getRecentTickets(params: GetRecentTicketsParams): TicketListItem[] {
    const limit = parseInt(params.limit || '5');
    const tickets = this.readJsonFile<{ tickets: TicketListItem[] }>('recent.json');
    
    return tickets.tickets.slice(0, limit);
  }

  // GET /api/v1/tickets/count - Get ticket count grouped by status
  public getTicketCount(): TicketCount {
    return this.readJsonFile<TicketCount>('count.json');
  }

  // GET /api/v1/tickets/all - Get all company tickets (admin only)
  public getAllCompanyTickets(params: GetAllCompanyTicketsParams): PaginatedResponse<TicketListItem> {
    // For now, return same data as regular getTickets but could be enhanced
    // In real implementation, this would filter by companyId
    return this.getTickets({
      page: params.page,
      size: params.size,
      sort: params.sort
    });
  }

  // GET /api/v1/tickets/{ticketId}/comments - Get ticket comments
  public getTicketComments(ticketId: string): Comment[] {
    const comments = this.readJsonFile<{ comments: Comment[] }>('comments.json');
    return comments.comments.filter(c => c.ticketId === ticketId);
  }

  // POST /api/v1/tickets/{ticketId}/comments - Add comment to ticket
  public addComment(ticketId: string, commentData: CreateCommentRequest): Comment {
    // Verify ticket exists
    this.getTicketById(ticketId);
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content: commentData.content,
      isInternal: commentData.isInternal,
      ticketId: ticketId,
      authorId: 'user-mock-123',
      authorName: 'Mock User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('[MOCK] Added comment:', newComment);
    return newComment;
  }

  // GET /api/v1/tickets/{ticketId}/attachments - Get ticket attachments
  public getTicketAttachments(ticketId: string): Attachment[] {
    const attachments = this.readJsonFile<{ attachments: Attachment[] }>('attachments.json');
    return attachments.attachments.filter(a => a.ticketId === ticketId);
  }

  // POST /api/v1/tickets/{ticketId}/attachments - Upload attachment
  public uploadAttachment(ticketId: string, attachmentData: UploadAttachmentRequest): Attachment {
    // Verify ticket exists
    this.getTicketById(ticketId);
    
    const newAttachment: Attachment = {
      id: `attachment-${Date.now()}`,
      filename: `mock-file-${Date.now()}.pdf`,
      size: 1024576, // 1MB mock size
      contentType: 'application/pdf',
      ticketId: ticketId,
      uploadedById: 'user-mock-123',
      uploadedByName: 'Mock User',
      uploadedAt: new Date().toISOString(),
      s3Key: `attachments/${ticketId}/mock-file-${Date.now()}.pdf`
    };
    
    console.log('[MOCK] Uploaded attachment:', newAttachment);
    return newAttachment;
  }
}