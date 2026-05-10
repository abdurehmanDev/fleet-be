import { IPaginationQuery } from '../interfaces';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function parsePagination(query: IPaginationQuery): {
  page: number;
  limit: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
} {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    sort: query.sort || 'created_at',
    order: query.order || 'desc',
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
