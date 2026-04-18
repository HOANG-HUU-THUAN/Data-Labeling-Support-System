import axiosInstance from './axios';
import type { AuditLog } from '../types/audit';

export interface PageResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  data: T[];
}

export const getAllLogs = async (page = 0, size = 10): Promise<PageResponse<AuditLog>> => {
  const response = await axiosInstance.get(`/v1/audit-logs`, { params: { page, size } });
  return response.data.data;
};
