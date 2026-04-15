import axiosInstance from './axios';
import type { LoginResponse } from '../types/auth';

export const loginApi = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post('/v1/auth/login', { username, password });
  const data = response.data.data;
  return {
    token: data.token,
    user: {
      id: data.id,
      name: data.username,
      email: data.email,
      role: data.roles?.[0]?.replace('ROLE_', '') || 'ANNOTATOR',
    }
  };
};
