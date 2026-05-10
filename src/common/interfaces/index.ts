export interface IPaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
}

export interface IErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  errors?: string[];
  timestamp: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IRequestUser {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface IDriverEarningsBreakdown {
  weekly_earning: number;
  cash: number;
  tax: number;
  toll: number;
  rent: number;
  uber_subscription: number;
  adjustment: number;
  other: number;
  total_amount: number;
}

export interface ICompanyEarningsBreakdown {
  total_company_earning: number;
  total_driver_payouts: number;
  owner_earning: number;
}

export interface IWeekRange {
  weekStartDate: Date;
  weekEndDate: Date;
  label: string;
}

export interface IAuditLogEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  beforeData?: any;
  afterData?: any;
}
