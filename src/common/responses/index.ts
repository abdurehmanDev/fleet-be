import { IApiResponse, IErrorResponse, IPaginatedResponse } from '../interfaces';

export class ApiResponse {
  static success<T>(message: string, data: T, meta?: Record<string, any>): IApiResponse<T> {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return response;
  }

  static error(
    message: string,
    errorCode: string,
    errors?: string[]
  ): IErrorResponse {
    return {
      success: false,
      message,
      errorCode,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): IPaginatedResponse<T> {
    return {
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
