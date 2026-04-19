import axiosInstance from './axios';

export interface OverallStats {
  totalTasks: number;
  assignedTasks: number;
  pendingApproval: number;
  rejectedTasks: number;
  approvedTasks: number;
}

export interface UserPerformance {
  userId: number;
  username: string;
  role: string;
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  rejectedTasks: number;
}

export interface DashboardResponse {
  overall: OverallStats;
  userPerformances: UserPerformance[];
}

export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await axiosInstance.get('/v1/dashboard/stats');
  return response.data.data;
};
