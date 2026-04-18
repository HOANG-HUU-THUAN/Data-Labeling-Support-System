import axiosInstance from './axios';
import { ExportFormat } from '../types/export';

export const exportProjectData = async (projectId: number, format: string): Promise<Blob> => {
  const response = await axiosInstance.get(`/v1/projects/${projectId}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
};
