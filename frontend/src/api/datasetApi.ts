import axiosInstance from './axios';
import type { Dataset, DatasetImage } from '../types/dataset';

export const getDatasetsByProject = async (projectId: number): Promise<Dataset[]> => {
  // It seems we need a GET route.
  // We'll mock the promise, wait no, we must hit an endpoint.
  // Maybe /projects/{projectId}/datasets
  const response = await axiosInstance.get(`/v1/projects/${projectId}/datasets`);
  return response.data.data;
};

export const getDatasetsByIds = async (ids: number[]): Promise<Dataset[]> => {
  const response = await axiosInstance.get(`/v1/datasets`, { params: { ids: ids.join(',') } });
  return response.data.data;
};

export const deleteDataset = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/v1/datasets/${id}`);
};

export const uploadDataset = async (projectId: number, files: File[], name: string): Promise<string> => {
  const formData = new FormData();
  formData.append('name', name);
  files.forEach(file => {
    formData.append('images', file);
  });
  
  const response = await axiosInstance.post(
    `/v1/projects/${projectId}/datasets/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const getImagesByDatasetId = async (datasetId: number): Promise<DatasetImage[]> => {
  const response = await axiosInstance.get(`/v1/datasets/${datasetId}/images`);
  return response.data.data;
};
