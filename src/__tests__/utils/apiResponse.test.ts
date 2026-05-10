import { describe, it, expect } from '@jest/globals';
import { ApiResponse } from '../../common/responses';

describe('ApiResponse', () => {
  it('success - should format success response with data', () => {
    const result = ApiResponse.success('Operation successful', { id: 1, name: 'Test' });
    expect(result.success).toBe(true);
    expect(result.message).toBe('Operation successful');
    expect(result.data).toEqual({ id: 1, name: 'Test' });
  });

  it('success - should format success response with meta', () => {
    const meta = { page: 1, limit: 10, total: 100 };
    const result = ApiResponse.success('List fetched', [{ id: 1 }], meta);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.meta).toEqual(meta);
  });

  it('error - should format error response', () => {
    const result = ApiResponse.error('Something went wrong', 'INTERNAL_ERROR');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Something went wrong');
    expect(result.errorCode).toBe('INTERNAL_ERROR');
  });

  it('error - should format error response with errors array', () => {
    const result = ApiResponse.error('Validation failed', 'VALIDATION_ERROR', ['email: required']);
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(['email: required']);
  });

  it('paginated - should format paginated response', () => {
    const result = ApiResponse.paginated('List fetched', [{ id: 1 }], 1, 10, 25);
    expect(result.success).toBe(true);
    expect(result.meta.totalPages).toBe(3);
  });
});
