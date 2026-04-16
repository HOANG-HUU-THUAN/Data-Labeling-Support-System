import axiosInstance from './axios';

export interface User {
  id: number;
  username: string;
  email: string;
  status: string;
  roles: string[];
}

export const getUsersByRole = async (role: string): Promise<User[]> => {
  const response = await axiosInstance.get(`/v1/users/roles/${role}`);
  return response.data.data;
};
