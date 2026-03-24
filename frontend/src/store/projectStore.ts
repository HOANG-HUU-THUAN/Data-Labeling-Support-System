import { create, type StateCreator, type SetState, type GetState } from 'zustand';
import type { Project } from '../types/project';
import * as projectApi from '../api/projectApi';

/**
 * Định nghĩa trạng thái và hàm của Project Store
 */
interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;

  // Hàm lấy danh sách dự án
  fetchProjects: () => Promise<void>;

  // Hàm lấy chi tiết dự án
  fetchProjectById: (id: number) => Promise<Project | null>;

  // Hàm tạo dự án mới
  addProject: (data: { name: string; description: string; type?: string }) => Promise<Project>;

  // Hàm cập nhật dự án
  updateProjectData: (id: number, data: Partial<Project>) => Promise<void>;

  // Hàm xóa dự án
  removeProject: (id: number) => Promise<void>;

  // Hàm xóa lỗi
  clearError: () => void;
}

/**
 * Project Store - Quản lý trạng thái dự án
 * Sử dụng Zustand để quản lý state một cách đơn giản và hiệu quả
 */
const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  /**
   * Lấy danh sách tất cả dự án
   */
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectApi.getProjects();
      set({ projects, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi lấy danh sách dự án';
      set({ error: errorMessage, loading: false });
    }
  },

  /**
   * Lấy chi tiết dự án theo ID
   */
  fetchProjectById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const project = await projectApi.getProjectById(id);
      return project;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi lấy chi tiết dự án';
      set({ error: errorMessage });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Tạo dự án mới
   */
  addProject: async (data: { name: string; description: string; type?: string }) => {
    set({ loading: true, error: null });
    try {
      const newProject = await projectApi.createProject(data);
      const currentProjects = get().projects;
      set({ projects: [...currentProjects, newProject], loading: false });
      return newProject;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tạo dự án';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Cập nhật dự án
   */
  updateProjectData: async (id: number, data: Partial<Project>) => {
    set({ loading: true, error: null });
    try {
      const updatedProject = await projectApi.updateProject(id, data);
      const currentProjects = get().projects;
      const index = currentProjects.findIndex((p: Project) => p.id === id);
      if (index !== -1) {
        currentProjects[index] = updatedProject;
        set({ projects: [...currentProjects] });
      }
      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật dự án';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Xóa dự án
   */
  removeProject: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await projectApi.deleteProject(id);
      const currentProjects = get().projects;
      set({ projects: currentProjects.filter((p: Project) => p.id !== id), loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa dự án';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Xóa thông báo lỗi
   */
  clearError: () => {
    set({ error: null });
  },
}));

export { useProjectStore };
