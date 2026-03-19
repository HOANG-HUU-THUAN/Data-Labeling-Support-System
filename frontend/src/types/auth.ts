export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'ANNOTATOR' | 'REVIEWER';
}

export interface LoginResponse {
  token: string;
  user: User;
}
