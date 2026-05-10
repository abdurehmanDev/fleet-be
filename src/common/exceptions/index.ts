import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly errors?: string[];

  constructor(
    statusCode: number,
    message: string,
    errorCode: string = 'APP_ERROR',
    isOperational: boolean = true,
    errors?: string[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(StatusCodes.NOT_FOUND, `${resource} not found`, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(StatusCodes.UNAUTHORIZED, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden: Insufficient permissions') {
    super(StatusCodes.FORBIDDEN, message, 'FORBIDDEN');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errors?: string[]) {
    super(StatusCodes.BAD_REQUEST, message, 'BAD_REQUEST', true, errors);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict: Resource already exists') {
    super(StatusCodes.CONFLICT, message, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: string[]) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message, 'VALIDATION_ERROR', true, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, 'INTERNAL_ERROR', false);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, 'DB_ERROR', false);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(StatusCodes.UNAUTHORIZED, message, 'AUTH_ERROR');
  }
}
