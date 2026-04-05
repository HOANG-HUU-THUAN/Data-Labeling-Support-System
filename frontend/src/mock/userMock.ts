import type { Role } from '../types/auth';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  isLocked: boolean;
}

let USERS: AppUser[] = [
  { id: 1, name: 'Admin',     email: 'admin@gmail.com',     role: 'ADMIN',     isLocked: false },
  { id: 2, name: 'Manager',   email: 'manager@gmail.com',   role: 'MANAGER',   isLocked: false },
  { id: 3, name: 'Annotator', email: 'annotator@gmail.com', role: 'ANNOTATOR', isLocked: false },
  { id: 4, name: 'Reviewer',  email: 'reviewer@gmail.com',  role: 'REVIEWER',  isLocked: false },
];

let nextId = 5;

export const getUsers = (): Promise<AppUser[]> =>
  new Promise((resolve) => setTimeout(() => resolve([...USERS]), 300));

export const toggleLockUser = (id: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      USERS = USERS.map((u) => (u.id === id ? { ...u, isLocked: !u.isLocked } : u));
      resolve();
    }, 300);
  });

export const updateUser = (id: number, patch: Partial<Pick<AppUser, 'name' | 'email' | 'role'>>): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      USERS = USERS.map((u) => (u.id === id ? { ...u, ...patch } : u));
      resolve();
    }, 300);
  });

export const deleteUser = (id: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      USERS = USERS.filter((u) => u.id !== id);
      resolve();
    }, 300);
  });

export const createUser = (data: Omit<AppUser, 'id'>): Promise<AppUser> =>
  new Promise((resolve) => {
    setTimeout(() => {
      const user: AppUser = { id: nextId++, ...data };
      USERS = [...USERS, user];
      resolve(user);
    }, 300);
  });
