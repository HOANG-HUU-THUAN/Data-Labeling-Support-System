import axiosInstance from './axios';
import type { Annotation } from '../types/annotation';

export const lockImage = async (imageId: number, userId: number): Promise<{ locked: boolean }> => {
  const response = await axiosInstance.post(`/v1/images/${imageId}/lock`, { userId });
  return response.data.data;
};

export const unlockImage = async (imageId: number): Promise<void> => {
  await axiosInstance.post(`/v1/images/${imageId}/unlock`);
};

export const getAnnotationsByImage = async (imageId: number): Promise<Annotation[]> => {
  const response = await axiosInstance.get(`/v1/images/${imageId}/annotations`);
  return response.data.data;
};

export const createAnnotation = async (data: Omit<Annotation, 'id'>): Promise<Annotation> => {
  const response = await axiosInstance.post(`/v1/annotations`, data);
  return response.data.data;
};

export const updateAnnotation = async (
  id: number,
  data: Partial<Omit<Annotation, 'id' | 'imageId'>>
): Promise<Annotation> => {
  const response = await axiosInstance.put(`/v1/annotations/${id}`, data);
  return response.data.data;
};

export const deleteAnnotation = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/v1/annotations/${id}`);
};

export const replaceAnnotationsForImage = async (imageId: number, replacements: Annotation[]): Promise<void> => {
  await axiosInstance.put(`/v1/images/${imageId}/annotations/replace`, { replacements });
};
