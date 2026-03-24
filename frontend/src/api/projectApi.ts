// import axiosInstance from './axios';
import type { Project } from '../types/project';

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
  
  // Hiện tại sử dụng mock
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProject: Project = {
        id: Math.floor(Math.random() * 10000),
        ...data,
      };
      resolve(newProject);
    }, 500);
  });
};

/**
 * API - Lấy danh sách tất cả dự án
 * @returns Promise<Project[]> - Danh sách dự án
 */
export const getProjects = (): Promise<Project[]> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.get('/projects');
  
  // Hiện tại sử dụng mock
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([]);
    }, 300);
  });
};

/**
 * API - Lấy chi tiết dự án theo ID
 * @param id - ID dự án
 * @returns Promise<Project> - Chi tiết dự án
 */
export const getProjectById = (_id: number): Promise<Project> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.get(`/projects/${id}`);
  
  // Hiện tại sử dụng mock
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Không tìm thấy dự án'));
    }, 300);
  });
};

/**
 * API - Cập nhật dự án
 * @param id - ID dự án
 * @param data - Dữ liệu cập nhật
 * @returns Promise<Project> - Dự án sau khi cập nhật
 */
export const updateProject = (
  _id: number,
  _data: Partial<Project>
): Promise<Project> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.put(`/projects/${id}`, data);
  
  // Hiện tại sử dụng mock
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Cập nhật thất bại'));
    }, 300);
  });
};

/**
 * API - Xóa dự án
 * @param id - ID dự án
 * @returns Promise<void>
 */
export const deleteProject = (_id: number): Promise<void> => {
  // TODO: Thay bằng API thực khi backend sẵn sàng
  // return axiosInstance.delete(`/projects/${id}`);
  
  // Hiện tại sử dụng mock
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Xóa thất bại'));
    }, 300);
  });
};
