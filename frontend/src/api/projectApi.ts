// import axiosInstance from './axios';
import type { Project } from '../types/project';
import * as projectMock from '../mock/projectMock';

/**
 * API - Tạo dự án mới
 * @param data - Dữ liệu dự án (name, description, type)
 * @returns Promise<Project> - Dự án vừa tạo
 */
export const createProject = (data: {
  name: string;
  description: string;
  type?: string;
}): Promise<Project> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.post('/projects', data);
  
  return projectMock.createProject(data as any);
};

/**
 * API - Lấy danh sách tất cả dự án
 * @returns Promise<Project[]> - Danh sách dự án
 */
export const getProjects = (): Promise<Project[]> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.get('/projects');
  
  return projectMock.getProjects();
};

/**
 * API - Lấy chi tiết dự án theo ID
 * @param id - ID dự án
 * @returns Promise<Project> - Chi tiết dự án
 */
export const getProjectById = (id: number): Promise<Project> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.get(`/projects/${id}`);
  
  return new Promise(async (resolve, reject) => {
    try {
      const project = await projectMock.getProjectById(id);
      if (!project) {
        reject(new Error('Không tìm thấy dự án'));
      } else {
        resolve(project);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * API - Cập nhật dự án
 * @param id - ID dự án
 * @param data - Dữ liệu cập nhật
 * @returns Promise<Project> - Dự án sau khi cập nhật
 */
export const updateProject = (
  id: number,
  data: Partial<Project>
): Promise<Project> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.put(`/projects/${id}`, data);
  
  return projectMock.updateProject(id, data);
};

/**
 * API - Xóa dự án
 * @param id - ID dự án
 * @returns Promise<void>
 */
export const deleteProject = (id: number): Promise<void> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.delete(`/projects/${id}`);
  
  return projectMock.deleteProject(id);
};
