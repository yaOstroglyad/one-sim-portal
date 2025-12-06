import { Response, Application } from 'express';
import { BaseController } from '../../shared/base.controller';
import { TicketsService } from './tickets.service';
import { MockRequest } from '../../types';
import { CreateTicketRequest, UpdateTicketRequest, UpdateTicketStatusRequest, CreateCommentRequest, UploadAttachmentRequest } from './ticket';

export class TicketsController extends BaseController {
  private ticketsService: TicketsService;

  constructor() {
    super('TicketsController');
    this.ticketsService = new TicketsService();
  }

  // GET /api/v1/tickets - Get paginated tickets
  private getTickets = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/tickets', req.query);
      const result = this.ticketsService.getTickets(req.query as any);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(res, error, 'Failed to load tickets');
    }
  }

  // POST /api/v1/tickets - Create a new ticket
  private createTicket = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('POST', '/api/v1/tickets', { body: req.body });
      
      const ticketData: CreateTicketRequest = req.body;
      const createdTicket = this.ticketsService.createTicket(ticketData);
      this.successResponse(res, createdTicket, 201);
    } catch (error) {
      this.handleError(res, error, 'Failed to create ticket');
    }
  }

  // GET /api/v1/tickets/{id} - Get ticket by ID
  private getTicketById = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', `/api/v1/tickets/${req.params.id}`, req.params);
      
      this.validateRequiredParams(req.params, ['id']);
      
      const ticket = this.ticketsService.getTicketById(req.params.id);
      this.successResponse(res, ticket);
    } catch (error) {
      this.handleError(res, error, 'Failed to get ticket');
    }
  }

  // PUT /api/v1/tickets/{id} - Update ticket
  private updateTicket = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('PUT', `/api/v1/tickets/${req.params.id}`, { params: req.params, body: req.body });

      this.validateRequiredParams(req.params, ['id']);

      const updateData: UpdateTicketRequest = req.body;
      const updatedTicket = this.ticketsService.updateTicket(req.params.id, updateData);
      this.successResponse(res, updatedTicket);
    } catch (error) {
      this.handleError(res, error, 'Failed to update ticket');
    }
  }

  // PUT /api/v1/tickets/{id}/status - Update ticket status only
  private updateTicketStatus = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('PUT', `/api/v1/tickets/${req.params.id}/status`, { params: req.params, body: req.body });

      this.validateRequiredParams(req.params, ['id']);

      const { status }: UpdateTicketStatusRequest = req.body;
      const updatedTicket = this.ticketsService.updateTicketStatus(req.params.id, status);
      this.successResponse(res, updatedTicket);
    } catch (error) {
      this.handleError(res, error, 'Failed to update ticket status');
    }
  }

  // DELETE /api/v1/tickets/{id} - Delete ticket
  private deleteTicket = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('DELETE', `/api/v1/tickets/${req.params.id}`, req.params);
      
      this.validateRequiredParams(req.params, ['id']);
      
      this.ticketsService.deleteTicket(req.params.id);
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error, 'Failed to delete ticket');
    }
  }

  // GET /api/v1/tickets/recent - Get recent tickets
  private getRecentTickets = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/tickets/recent', req.query);
      const result = this.ticketsService.getRecentTickets(req.query as any);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(res, error, 'Failed to load recent tickets');
    }
  }

  // GET /api/v1/tickets/count - Get ticket count
  private getTicketCount = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/tickets/count', req.query);
      const result = this.ticketsService.getTicketCount();
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(res, error, 'Failed to load ticket count');
    }
  }

  // GET /api/v1/tickets/stats - Get ticket statistics for overview
  private getTicketStats = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/tickets/stats', req.query);
      const stats = this.ticketsService.getTicketStats();
      this.successResponse(res, stats);
    } catch (error) {
      this.handleError(res, error, 'Failed to load ticket statistics');
    }
  }

  // GET /api/v1/tickets/all - Get all company tickets (admin only)
  private getAllCompanyTickets = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/tickets/all', req.query);
      
      this.validateRequiredParams(req.query, ['companyId']);
      
      const result = this.ticketsService.getAllCompanyTickets(req.query as any);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(res, error, 'Failed to load company tickets');
    }
  }

  // GET /api/v1/tickets/{ticketId}/comments - Get ticket comments
  private getTicketComments = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', `/api/v1/tickets/${req.params.ticketId}/comments`, req.params);
      
      this.validateRequiredParams(req.params, ['ticketId']);
      
      const comments = this.ticketsService.getTicketComments(req.params.ticketId);
      this.successResponse(res, comments);
    } catch (error) {
      this.handleError(res, error, 'Failed to load ticket comments');
    }
  }

  // POST /api/v1/tickets/{ticketId}/comments - Add comment to ticket
  private addComment = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('POST', `/api/v1/tickets/${req.params.ticketId}/comments`, { params: req.params, body: req.body });
      
      this.validateRequiredParams(req.params, ['ticketId']);
      
      const commentData: CreateCommentRequest = req.body;
      const newComment = this.ticketsService.addComment(req.params.ticketId, commentData);
      this.successResponse(res, newComment, 201);
    } catch (error) {
      this.handleError(res, error, 'Failed to add comment');
    }
  }

  // GET /api/v1/tickets/{ticketId}/attachments - Get ticket attachments
  private getTicketAttachments = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', `/api/v1/tickets/${req.params.ticketId}/attachments`, req.params);
      
      this.validateRequiredParams(req.params, ['ticketId']);
      
      const attachments = this.ticketsService.getTicketAttachments(req.params.ticketId);
      this.successResponse(res, attachments);
    } catch (error) {
      this.handleError(res, error, 'Failed to load ticket attachments');
    }
  }

  // POST /api/v1/tickets/{ticketId}/attachments - Upload attachment
  private uploadAttachment = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('POST', `/api/v1/tickets/${req.params.ticketId}/attachments`, { params: req.params, body: req.body });
      
      this.validateRequiredParams(req.params, ['ticketId']);
      
      const attachmentData: UploadAttachmentRequest = req.body;
      const newAttachment = this.ticketsService.uploadAttachment(req.params.ticketId, attachmentData);
      this.successResponse(res, newAttachment, 201);
    } catch (error) {
      this.handleError(res, error, 'Failed to upload attachment');
    }
  }

  // Register routes on Express app
  public registerRoutes(app: Application): void {
    // Main tickets endpoints
    app.get('/api/v1/tickets', this.getTickets);
    app.post('/api/v1/tickets', this.createTicket);
    
    // Specific endpoints MUST be registered BEFORE parameterized routes
    app.get('/api/v1/tickets/recent', this.getRecentTickets);
    app.get('/api/v1/tickets/count', this.getTicketCount);
    app.get('/api/v1/tickets/stats', this.getTicketStats);
    app.get('/api/v1/tickets/all', this.getAllCompanyTickets);
    
    // Individual ticket operations (with :id parameter)
    app.get('/api/v1/tickets/:id', this.getTicketById);
    app.put('/api/v1/tickets/:id/status', this.updateTicketStatus);
    app.put('/api/v1/tickets/:id', this.updateTicket);
    app.delete('/api/v1/tickets/:id', this.deleteTicket);
    
    // Comments
    app.get('/api/v1/tickets/:ticketId/comments', this.getTicketComments);
    app.post('/api/v1/tickets/:ticketId/comments', this.addComment);
    
    // Attachments
    app.get('/api/v1/tickets/:ticketId/attachments', this.getTicketAttachments);
    app.post('/api/v1/tickets/:ticketId/attachments', this.uploadAttachment);
  }
}