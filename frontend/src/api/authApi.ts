import { mockLogin } from '../mock/authMock';
import type { LoginResponse } from '../types/auth';

export const loginApi = (email: string, password: string): Promise<LoginResponse> => {
  // TODO: Thay bằng axiosInstance khi backend sẵn sàng
  // return axiosInstance.post('/auth/login', { email, password });
  return mockLogin(email, password);
};
