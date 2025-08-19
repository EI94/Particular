// Utility types for the real estate management system
import type { Unit, Tenant, Lease, Payment } from './models';

// Status types
export type UnitStatus = "vacant" | "occupied" | "maintenance" | "reserved";
export type PaymentStatus = "pending" | "paid" | "late" | "failed" | "overdue";
export type LeaseStatus = "active" | "expired" | "terminated" | "pending";

// Form types
export type CreateUnitForm = Omit<Unit, 'id' | 'createdAt'>;
export type CreateTenantForm = Omit<Tenant, 'id' | 'createdAt'>;
export type CreateLeaseForm = Omit<Lease, 'id' | 'createdAt'>;
export type CreatePaymentForm = Omit<Payment, 'id' | 'createdAt'>;

// Update types
export type UpdateUnitForm = Partial<Omit<Unit, 'id' | 'ownerId' | 'createdAt'>>;
export type UpdateTenantForm = Partial<Omit<Tenant, 'id' | 'ownerId' | 'createdAt'>>;
export type UpdateLeaseForm = Partial<Omit<Lease, 'id' | 'unitId' | 'tenantId' | 'createdAt'>>;

// Filter types
export type UnitFilters = {
  status?: UnitStatus;
  city?: string;
  minRooms?: number;
  maxRooms?: number;
  minM2?: number;
  maxM2?: number;
  minRent?: number;
  maxRent?: number;
};

export type PaymentFilters = {
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
};

// Dashboard types
export type DashboardStats = {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalRent: number;
  pendingPayments: number;
  overduePayments: number;
  totalTenants: number;
  activeLeases: number;
};

// Notification types
export type NotificationType = 
  | "payment_due"
  | "payment_overdue"
  | "lease_expiring"
  | "certification_due"
  | "maintenance_required";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string; // ID of related entity (lease, payment, etc.)
  isRead: boolean;
  createdAt: any;
  readAt?: any;
};
