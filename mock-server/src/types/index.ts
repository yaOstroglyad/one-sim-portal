import { Request } from 'express';

// Extended Express types with custom query parameters
export interface MockRequest extends Request {
  query: Request['query'] & {
    mock_delay?: string;
    mock_error?: string;
    page?: string;
    size?: string;
    sort?: string;
    username?: string;
    email?: string;
    accountType?: string;
    accountId?: string;
  };
}

// Shared pagination response structure
export interface PaginatedResponse<T> {
  content: T[];
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

// Controller interface
export interface Controller {
  registerRoutes(app: any): void;
}

// Service error
export class ServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
  }
}
