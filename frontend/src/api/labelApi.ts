import axiosInstance from './axios';
import type { Label } from '../types/label';

export const getLabelsByProject = async (projectId: number): Promise<Label[]> => {
  // If there's no endpoint for this in LabelController, maybe ProjectController has it? Or just assume it's here
  const response = await axiosInstance.get(`/projects/${projectId}/labels`);
  return response.data.data || [];
};

export const createLabel = async (
  data: Pick<Label, 'name' | 'color'> & { projectId: number }
): Promise<Label> => {
  const response = await axiosInstance.post(`/projects/${data.projectId}/labels`, data);
  return response.data.data;
};

export const updateLabel = async (
  id: number,
  data: Pick<Label, 'name' | 'color'>
): Promise<Label> => {
  const response = await axiosInstance.put(`/labels/${id}`, data);
  return response.data.data;
};

export const deleteLabel = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/labels/${id}`);
};
