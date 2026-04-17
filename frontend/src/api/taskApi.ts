import axiosInstance from './axios';
import type { Task, TaskStatus, MyTask } from '../types/task';
import type { PageParams, PageResponse } from '../types/common';

export const getTasks = async (params?: PageParams & { status?: string }): Promise<PageResponse<Task>> => {
  const response = await axiosInstance.get(`/v1/tasks`, { params });
  return response.data.data;
};

export const getTaskById = async (id: number): Promise<Task | undefined> => {
  const response = await axiosInstance.get(`/v1/tasks/${id}`);

  return response.data.data;
};

export const createBatchTasks = async (
  projectId: number,
  data: {
    datasetId: number;
    imagesPerTask: number;
    annotatorIds: number[];
    reviewerIds?: number[];
  }
): Promise<string> => {
  const response = await axiosInstance.post(`/v1/projects/${projectId}/tasks/batch`, data);
  return response.data; // Server returns ApiResponse<String> for this endpoint. (Wait it's response.data.data for the innermost data)
};

export const deleteTask = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/v1/tasks/${id}`);
};

export const updateTask = async (
  id: number,
  data: { name: string; datasetIds: number[]; assigneeId?: number | null; reviewerId?: number | null }
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

export const getMyTasks = async (params?: PageParams & { projectName?: string; status?: string }): Promise<PageResponse<MyTask>> => {
  const response = await axiosInstance.get(`/v1/tasks/my-tasks`, { params });
  return response.data.data;
};

export const getTasksForReview = async (params?: PageParams & { projectName?: string; status?: string }): Promise<PageResponse<MyTask>> => {
  const response = await axiosInstance.get(`/v1/tasks/review`, { params });
  return response.data.data;
};

export const getTaskImages = async (taskId: number): Promise<{ id: number, name: string, url: string }[]> => {
  const response = await axiosInstance.get(`/v1/tasks/${taskId}/images`);
  return response.data.data.map((item: any) => ({
    id: item.imageId,
    name: item.filePath,
    url: item.originalUrl,
    thumbnailUrl: item.thumbnailUrl,
  }));
};

