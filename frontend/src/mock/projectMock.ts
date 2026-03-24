import type { Project } from '../types/project';

// Dữ liệu mock — mutable để simulate update trong session
let projects: Project[] = [
  { id: 1, name: 'Project A', description: 'Dự án gán nhãn ảnh y tế' },
  { id: 2, name: 'Project B', description: 'Dự án phân loại văn bản' },
  { id: 3, name: 'Project C', description: 'Dự án nhận diện đối tượng' },
];

export const getProjects = (): Promise<Project[]> =>
  new Promise((resolve) => setTimeout(() => resolve([...projects]), 300));

export const getProjectById = (id: number): Promise<Project | undefined> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(projects.find((p) => p.id === id)), 300)
  );

export const createProject = (
  data: Pick<Project, 'name' | 'description'>
): Promise<Project> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
      const newProject: Project = { id: newId, ...data };
      projects.push(newProject);
      resolve(newProject);
    }, 300)
  );

export const updateProject = (
  id: number,
  data: Pick<Project, 'name' | 'description'>
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
