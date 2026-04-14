import type { LoginResponse } from '../types/auth';

const MOCK_USERS: Record<string, { password: string; response: LoginResponse }> = {
  'admin@gmail.com': {
    password: '123456',
    response: {
      token: 'mock-jwt-token-admin-123456',
      user: { id: 1, name: 'Admin', email: 'admin@gmail.com', role: 'ADMIN' },
    },
  },
  'manager@gmail.com': {
    password: '123456',
    response: {
      token: 'mock-jwt-token-manager-123456',
      user: { id: 2, name: 'Manager', email: 'manager@gmail.com', role: 'MANAGER' },
    },
  },
  'annotator@gmail.com': {
    password: '123456',
    response: {
      token: 'mock-jwt-token-annotator-123456',
      user: { id: 3, name: 'Annotator', email: 'annotator@gmail.com', role: 'ANNOTATOR' },
    },
  },
  'reviewer@gmail.com': {
    password: '123456',
    response: {
      token: 'mock-jwt-token-reviewer-123456',
      user: { id: 4, name: 'Reviewer', email: 'reviewer@gmail.com', role: 'REVIEWER' },
    },
  },
};

// Giả lập độ trễ mạng 500ms
export const mockLogin = (email: string, password: string): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const account = MOCK_USERS[email];
      if (account && account.password === password) {
        resolve(account.response);
      } else {
        reject(new Error('Email hoặc mật khẩu không đúng'));
      }
    }, 500);
  });
};
