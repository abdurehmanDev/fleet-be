import { describe, it, expect } from '@jest/globals';
import { createPaginatedResponse, parsePagination } from '../../common/utils/pagination.utils';

describe('Pagination Utils', () => {
  it('parsePagination - should parse default pagination', () => {
    const result = parsePagination({ page: 1, limit: 10 });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it('parsePagination - should calculate offset correctly', () => {
    const result = parsePagination({ page: 3, limit: 20 });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(40);
  });

  it('parsePagination - should default to page 1, limit 10', () => {
    const result = parsePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it('parsePagination - should handle sort and order', () => {
    const result = parsePagination({ page: 1, limit: 10, sort: 'created_at', order: 'desc' });
    expect(result.sort).toBe('created_at');
    expect(result.order).toBe('desc');
  });

  it('createPaginatedResponse - should create paginated response', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const result = createPaginatedResponse(items, 25, 1, 10);
    expect(result.data).toEqual(items);
    expect(result.meta.total).toBe(25);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalPages).toBe(3);
  });

  it('createPaginatedResponse - should handle empty data', () => {
    const result = createPaginatedResponse([], 0, 1, 10);
    expect(result.data).toEqual([]);
    expect(result.meta.totalPages).toBe(0);
  });
});
