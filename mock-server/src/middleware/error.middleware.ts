import { Response, NextFunction } from 'express';
import { MockRequest } from '../types';

// Error simulation middleware
export function errorSimulationMiddleware(req: MockRequest, res: Response, next: NextFunction): void {
  if (req.query.mock_error) {
    const errorCode = parseInt(String(req.query.mock_error));
    return res.status(errorCode).json({
      error: `Mock error ${errorCode}`,
      message: 'This is a simulated error for testing'
    });
  }
  next();
}

// Catch all - return 404 for unhandled endpoints
export function notFoundHandler(req: MockRequest, res: Response): void {
  console.log(`[MOCK] Unhandled endpoint: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Mock endpoint not implemented: ${req.method} ${req.url}`,
    hint: 'Add this endpoint to mock-server controllers'
  });
}