// src/app/models/api-response.model.ts
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  total?: number;
  error?: string;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}