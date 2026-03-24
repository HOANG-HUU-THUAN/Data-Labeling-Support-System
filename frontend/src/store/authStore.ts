import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Khôi phục session từ localStorage khi app load
const savedToken = localStorage.getItem('token');
const savedUserRaw = localStorage.getItem('user');
const restoredUser: User | null = savedUserRaw ? (JSON.parse(savedUserRaw) as User) : null;

const useAuthStore = create<AuthState>((set) => ({
  token: savedToken,
  user: restoredUser,

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    console.debug('[AuthStore] Logged in as:', user.email, '| Role:', user.role);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
