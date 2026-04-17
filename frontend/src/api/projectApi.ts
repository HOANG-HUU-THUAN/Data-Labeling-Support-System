import axiosInstance from './axios';
import type { Project } from '../types/project';
import type { PageParams, PageResponse } from '../types/common';

export const getProjects = async (params?: PageParams & { name?: string; type?: string }): Promise<PageResponse<Project>> => {
  const response = await axiosInstance.get('/projects', { params });
  return response.data.data;
};

export const getProjectById = async (id: number): Promise<Project | undefined> => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data.data;
};

export const createProject = async (
  data: Omit<Project, 'id'>
): Promise<Project> => {
  const response = await axiosInstance.post('/projects', data);
  return response.data.data;
};

export const updateProject = async (
  id: number,
  data: Omit<Project, 'id'>
): Promise<Project> => {
  const response = await axiosInstance.put(`/projects/${id}`, data);
  return response.data.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/projects/${id}`);
};
