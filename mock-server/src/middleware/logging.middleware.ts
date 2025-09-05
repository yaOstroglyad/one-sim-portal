import { Response, NextFunction } from 'express';
import { MockRequest } from '../types';

// Request logging middleware
export function requestLoggingMiddleware(req: MockRequest, res: Response, next: NextFunction): void {
  console.log(`[MOCK] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
}