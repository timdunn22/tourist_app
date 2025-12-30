// Error Handler Middleware
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
    body: req.body,
    user: (req as any).user?.id,
  });

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    return res.status(500).json({
      error: 'Something went wrong',
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Validate Request Middleware
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: (err as any).path,
        message: err.msg,
      })),
    });
  }
  
  next();
};
