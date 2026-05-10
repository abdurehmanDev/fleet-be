import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/exceptions';
import logger from '../config/logger';
import { ApiResponse } from '../common/responses';
import { StatusCodes } from 'http-status-codes';

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn({
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      message: err.message,
    });

    res.status(err.statusCode).json(
      ApiResponse.error(err.message, err.errorCode, err.errors)
    );
    return;
  }

  // Drizzle/PostgreSQL errors
  if (err.message?.includes('duplicate key')) {
    res.status(StatusCodes.CONFLICT).json(
      ApiResponse.error('Resource already exists', 'DUPLICATE_ENTRY')
    );
    return;
  }

  if (err.message?.includes('foreign key')) {
    res.status(StatusCodes.BAD_REQUEST).json(
      ApiResponse.error('Referenced resource not found', 'FK_VIOLATION')
    );
    return;
  }

  // Unknown errors
  logger.error({ err }, 'Unhandled error');
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
    ApiResponse.error(
      'Internal server error',
      'INTERNAL_ERROR'
    )
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json(
    ApiResponse.error(
      `Route ${req.method} ${req.originalUrl} not found`,
      'NOT_FOUND'
    )
  );
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
