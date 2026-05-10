import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../common/exceptions';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        next(new ValidationError('Validation failed', errors));
      } else {
        next(err);
      }
    }
  };
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        next(new ValidationError('Validation failed', errors));
      } else {
        next(err);
      }
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        next(new ValidationError('Validation failed', errors));
      } else {
        next(err);
      }
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        next(new ValidationError('Validation failed', errors));
      } else {
        next(err);
      }
    }
  };
}
