import axiosInstance from './axios';
import type { User } from '../types/user';

export interface PageResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  data: T[];
}

export const getAllUsers = async (page = 0, size = 10): Promise<PageResponse<User>> => {
  const response = await axiosInstance.get(`/v1/users`, { params: { page, size } });
  return response.data.data;
};

export const getUsersByRole = async (role: string): Promise<User[]> => {
  const response = await axiosInstance.get(`/v1/users/roles/${role}`);
  return response.data.data;
};

export const lockUser = async (id: number): Promise<void> => {
  await axiosInstance.patch(`/v1/users/${id}/lock`);
};

export const unlockUser = async (id: number): Promise<void> => {
  await axiosInstance.patch(`/v1/users/${id}/unlock`);
};

export const assignRoles = async (id: number, roles: string[]): Promise<User> => {
  const response = await axiosInstance.put(`/v1/users/${id}/roles`, { roles }); // Wait, check backend endpoint
  return response.data.data;
};

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  status?: string;
}

export const updateUser = async (id: number, data: UpdateUserRequest): Promise<User> => {
  const response = await axiosInstance.put(`/v1/users/${id}`, data);
  return response.data.data;
};
