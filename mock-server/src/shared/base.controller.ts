import { Response } from 'express';
import { MockRequest, Controller } from '../types';

export abstract class BaseController implements Controller {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // Common error handler
  protected handleError(res: Response, error: any, message: string = 'An error occurred'): void {
    console.error(`[${this.serviceName}]`, error);
    
    const statusCode = error.statusCode || 500;
    const errorResponse = {
      error: error.name || 'Internal Server Error',
      message: error.message || message,
      timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
      (errorResponse as any).stack = error.stack;
    }

    res.status(statusCode).json(errorResponse);
  }

  // Common success response
  protected successResponse<T>(res: Response, data: T, statusCode: number = 200): void {
    res.status(statusCode).json(data);
  }

  // Validate required parameters
  protected validateRequiredParams(params: any, required: string[]): void {
    const missing: string[] = [];
    
    for (const param of required) {
      if (!params[param]) {
        missing.push(param);
      }
    }

    if (missing.length > 0) {
      const error = new Error(`Missing required parameters: ${missing.join(', ')}`);
      (error as any).statusCode = 400;
      (error as any).name = 'Bad Request';
      throw error;
    }
  }

  // Parse pagination params with defaults
  protected parsePaginationParams(query: MockRequest['query']): { page: number; size: number; sort: string | null } {
    return {
      page: parseInt(query.page || '0'),
      size: parseInt(query.size || '20'),
      sort: query.sort || null
    };
  }

  // Log request
  protected logRequest(method: string, path: string, params: any): void {
    console.log(`[${this.serviceName}] ${method} ${path}`, params);
  }

  // Abstract method to register routes
  abstract registerRoutes(app: any): void;
}