import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Khi app load: khôi phục token từ localStorage
// Nếu có token, tạo mock user tạm để app không bị "logged out"
// TODO: thay bằng API /auth/me khi backend sẵn sàng
const savedToken = localStorage.getItem('token');
const restoredUser: User | null = savedToken
  ? { id: 0, name: 'Người dùng', email: '', role: 'ANNOTATOR' }
  : null;

const useAuthStore = create<AuthState>((set) => ({
  token: savedToken,
  user: restoredUser,

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
