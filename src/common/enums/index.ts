export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

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

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const VEHICLE_STATUS = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE',
} as const;

export type VehicleStatus = (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];

export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  EARNINGS_UPDATE: 'EARNINGS_UPDATE',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const SOCKET_EVENTS = {
  DRIVER_CREATED: 'driver.created',
  DRIVER_UPDATED: 'driver.updated',
  DRIVER_DELETED: 'driver.deleted',
  VEHICLE_CREATED: 'vehicle.created',
  VEHICLE_UPDATED: 'vehicle.updated',
  VEHICLE_DELETED: 'vehicle.deleted',
  EARNINGS_SAVED: 'earnings.saved',
  ANALYTICS_UPDATED: 'analytics.updated',
  NOTIFICATION_NEW: 'notification.new',
  NOTIFICATION_READ: 'notification.read',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
