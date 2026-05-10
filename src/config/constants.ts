// Application Constants

export const API_PREFIX = '/api/v1';

export const JWT = {
  ACCESS_EXPIRY: '15m',
  REFRESH_EXPIRY: '7d',
  COOKIE_NAME: 'refresh_token',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const VEHICLE_STATUS = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE',
} as const;

export const DRIVER_DEFAULTS = {
  MOBILE_REGEX: /^[6-9]\d{9}$/,
} as const;

export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
} as const;

export const WEEK = {
  START_DAY: 1, // Monday
  END_DAY: 0, // Sunday
} as const;

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
} as const;

export const PERMISSIONS = {
  CREATE_DRIVER: 'CREATE_DRIVER',
  UPDATE_DRIVER: 'UPDATE_DRIVER',
  DELETE_DRIVER: 'DELETE_DRIVER',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  CREATE_VEHICLE: 'CREATE_VEHICLE',
  UPDATE_VEHICLE: 'UPDATE_VEHICLE',
  DELETE_VEHICLE: 'DELETE_VEHICLE',
  MANAGE_EARNINGS: 'MANAGE_EARNINGS',
} as const;

export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  EARNINGS_UPDATE: 'EARNINGS_UPDATE',
} as const;

export const SOCKET_EVENTS = {
  DRIVER_CREATED: 'driver.created',
  DRIVER_UPDATED: 'driver.updated',
  DRIVER_DELETED: 'driver.deleted',
  VEHICLE_CREATED: 'vehicle.created',
  VEHICLE_UPDATED: 'vehicle.updated',
  VEHICLE_DELETED: 'vehicle.deleted',
  EARNINGS_SAVED: 'earnings.saved',
  ANALYTICS_UPDATED: 'analytics.updated',
} as const;
