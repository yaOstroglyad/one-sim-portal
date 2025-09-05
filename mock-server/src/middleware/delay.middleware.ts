import { Response, NextFunction } from 'express';
import { MockRequest } from '../types';

// Network delay simulation middleware
export function delayMiddleware(req: MockRequest, res: Response, next: NextFunction): void {
  const delay = parseInt(String(req.query.mock_delay)) || 100;
  setTimeout(next, delay);
}