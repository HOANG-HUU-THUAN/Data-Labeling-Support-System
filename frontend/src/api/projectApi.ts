import axiosInstance from './axios';
import type { Project } from '../types/project';

export const getProjects = async (): Promise<Project[]> => {
  const response = await axiosInstance.get('/projects');
  return response.data.data;
};

export const getProjectById = async (id: number): Promise<Project | undefined> => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data.data;
};

export const createProject = async (
  data: Pick<Project, 'name' | 'description'>
): Promise<Project> => {
  const response = await axiosInstance.post('/projects', data);
  return response.data.data;
};

export const updateProject = async (
  id: number,
  data: Pick<Project, 'name' | 'description'>
): Promise<Project> => {
  const response = await axiosInstance.put(`/projects/${id}`, data);
  return response.data.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/projects/${id}`);
};
