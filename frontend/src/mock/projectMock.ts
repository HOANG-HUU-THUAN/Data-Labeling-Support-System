import type { Project } from '../types/project';
import { ProjectType } from '../types/project';

// Dữ liệu mock — mutable để simulate update trong session
let projects: Project[] = [
  {
    id: 1,
    name: 'Project A',
    description: 'Dự án gán nhãn ảnh y tế để phát hiện các bất thường',
    type: ProjectType.OBJECT_DETECTION,
    createdDate: new Date('2024-01-15'),
    status: 'Đang hoạt động',
    itemCount: 150,
  },
  {
    id: 2,
    name: 'Project B',
    description: 'Dự án phân loại văn bản tin tức vào các chủ đề',
    type: ProjectType.IMAGE_CLASSIFICATION,
    createdDate: new Date('2024-02-10'),
    status: 'Đang hoạt động',
    itemCount: 500,
  },
  {
    id: 3,
    name: 'Project C',
    description: 'Dự án nhận diện đối tượng trong ảnh tế bào',
    type: ProjectType.SEGMENTATION,
    createdDate: new Date('2024-03-05'),
    status: 'Đang hoạt động',
    itemCount: 300,
  },
];

export const getProjects = (): Promise<Project[]> =>
  new Promise((resolve) => setTimeout(() => resolve([...projects]), 300));

export const getProjectById = (id: number): Promise<Project | undefined> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(projects.find((p) => p.id === id)), 300)
  );

export const createProject = (
  data: { name: string; description: string; type?: string }
): Promise<Project> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
      const newProject: Project = {
        id: newId,
        name: data.name,
        description: data.description,
        type: data.type,
        createdDate: new Date(),
        status: 'Đang hoạt động',
        itemCount: 0,
      };
      projects.push(newProject);
      resolve(newProject);
    }, 300)
  );

export const updateProject = (
  id: number,
  data: Partial<Project>
): Promise<Project> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) {
        reject(new Error('Không tìm thấy dự án'));
        return;
      }
      projects[index] = { ...projects[index], ...data };
      resolve(projects[index]);
    }, 300)
  );

export const deleteProject = (id: number): Promise<void> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const index = projects.findIndex((p) => p.id === id);
      if (index === -1) {
        reject(new Error('Không tìm thấy dự án'));
        return;
      }
      projects.splice(index, 1);
      resolve();
    }, 300)
  );
