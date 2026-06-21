export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface AuthUser {
  id: string;
  clerkId: string;
  role: string;
}
