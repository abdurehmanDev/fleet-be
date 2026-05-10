import { describe, it, expect } from '@jest/globals';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} from '../../common/exceptions';

describe('Custom Exceptions', () => {
  it('AppError - should set status code and message', () => {
    const err = new AppError(418, 'Test error', 'TEAPOT');
    expect(err.message).toBe('Test error');
    expect(err.statusCode).toBe(418);
    expect(err.errorCode).toBe('TEAPOT');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('BadRequestError - should have 400 status', () => {
    const err = new BadRequestError('Bad request');
    expect(err.statusCode).toBe(400);
    expect(err).toBeInstanceOf(AppError);
  });

  it('UnauthorizedError - should have 401 status', () => {
    const err = new UnauthorizedError('Unauthorized');
    expect(err.statusCode).toBe(401);
  });

  it('ForbiddenError - should have 403 status', () => {
    const err = new ForbiddenError('Forbidden');
    expect(err.statusCode).toBe(403);
  });

  it('NotFoundError - should have 404 status', () => {
    const err = new NotFoundError('User');
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('User');
  });

  it('ConflictError - should have 409 status', () => {
    const err = new ConflictError('Duplicate');
    expect(err.statusCode).toBe(409);
  });

  it('ValidationError - should have 422 status and errors array', () => {
    const err = new ValidationError('Validation failed', ['email: required', 'name: min 2 chars']);
    expect(err.statusCode).toBe(422);
    expect(err.errors).toEqual(['email: required', 'name: min 2 chars']);
  });

  it('InternalServerError - should have 500 status', () => {
    const err = new InternalServerError('Server error');
    expect(err.statusCode).toBe(500);
  });
});
