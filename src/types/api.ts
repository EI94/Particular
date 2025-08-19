// API types for the real estate management system

// Base API response
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Pagination types
export type PaginationParams = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// Search types
export type SearchParams = {
  query: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
};

// CRUD operation types
export type CreateResponse = {
  id: string;
  createdAt: any;
};

export type UpdateResponse = {
  id: string;
  updatedAt: any;
};

export type DeleteResponse = {
  id: string;
  deletedAt: any;
};

// Bulk operation types
export type BulkOperationResponse = {
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
};

// File upload types
export type FileUploadResponse = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: any;
};

// Export types
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type ExportResponse = {
  downloadUrl: string;
  expiresAt: any;
  filename: string;
};

// Webhook types
export type WebhookEvent = 
  | 'payment.received'
  | 'payment.failed'
  | 'lease.created'
  | 'lease.expired'
  | 'unit.status_changed'
  | 'tenant.added'
  | 'tenant.removed';

export type WebhookPayload = {
  event: WebhookEvent;
  timestamp: any;
  data: any;
  signature?: string;
};
