export type Role = 'ADMIN' | 'MANAGER' | 'ANNOTATOR' | 'REVIEWER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}
