import axiosInstance from './axios';
import type { Task, TaskStatus } from '../types/task';

// The backend endpoints I need:
// POST /v1/projects/{projectId}/tasks/batch -> createBatchTasks
// GET /v1/tasks/my-tasks
// GET /v1/tasks/{taskId}/images
// Note: We might have other missing endpoints in TaskController. I will map them directly matching the mock. If backend doesn't have it, it's a backend issue, but for now I'll just map them.

export const getTasks = async (): Promise<Task[]> => {
  const response = await axiosInstance.get(`/v1/tasks`);
  return response.data.data;
};

export const getTaskById = async (id: number): Promise<Task | undefined> => {
  const response = await axiosInstance.get(`/v1/tasks/${id}`);

  return response.data.data;
};

export const createTask = async (data: {
  name: string;
  projectId: number;
  datasetIds: number[];
  assigneeId?: number;
}): Promise<Task> => {
  // If we assume a generic create endpoint in case taskController adds it:
  const response = await axiosInstance.post(`/v1/tasks`, data);
  return response.data.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/v1/tasks/${id}`);
};

export const updateTask = async (
  id: number,
  data: { name: string; datasetIds: number[]; assigneeId?: number }
): Promise<Task> => {
  const response = await axiosInstance.put(`/v1/tasks/${id}`, data);
  return response.data.data;
};

export const assignTask = async (id: number, assigneeId: number | undefined): Promise<Task> => {
  const response = await axiosInstance.patch(`/v1/tasks/${id}/assignee`, { assigneeId });
  return response.data.data;
};

export const updateTaskStatus = async (id: number, status: TaskStatus): Promise<Task> => {
  const response = await axiosInstance.patch(`/v1/tasks/${id}/status`, { status });
  return response.data.data;
};

export const submitTask = async (id: number): Promise<Task> => {
  const response = await axiosInstance.post(`/v1/tasks/${id}/submit`);
  return response.data.data;
};

export const getMyTasks = async (_userId?: number): Promise<Task[]> => {
  // Assuming backend uses auth token, might not even need userId
  const response = await axiosInstance.get(`/v1/tasks/my-tasks`);
  return response.data.data;
};

export const getTaskImages = async (taskId: number): Promise<{ id: number, name: string, url: string }[]> => {
  const response = await axiosInstance.get(`/v1/tasks/${taskId}/images`);
  return response.data.data;
};

