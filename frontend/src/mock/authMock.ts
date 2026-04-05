import type { LoginResponse } from '../types/auth';
import { USERS } from './userMock';

// Giả lập độ trễ mạng 500ms
export const mockLogin = (email: string, password: string): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = USERS.find((u) => u.email === email);
      if (!user) {
        reject(new Error('Email không tồn tại'));
        return;
      }
      if (user.password !== password) {
        reject(new Error('Sai mật khẩu'));
        return;
      }
      if (user.isLocked) {
        reject(new Error('Tài khoản bị khóa'));
        return;
      }
      resolve({
        token: `mock-token-${user.id}`,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    }, 500);
  });
};
