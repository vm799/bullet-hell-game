/**
 * Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(
    `[Error] ${req.method} ${req.path}:`,
    {
      statusCode,
      message,
      stack: err.stack,
    }
  );

  res.status(statusCode).json({
    error: message,
    code: err.code,
    requestId: req.id,
  });
};

export const createApiError = (
  message: string,
  statusCode: number = 500,
  code?: string
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
};
