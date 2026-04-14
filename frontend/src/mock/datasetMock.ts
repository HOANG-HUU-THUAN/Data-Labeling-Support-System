import type { Dataset } from '../types/dataset';

let datasets: Dataset[] = [
  { id: 1, projectId: 1, name: 'image_001.jpg', url: 'https://picsum.photos/seed/ds1/600/400' },
  { id: 2, projectId: 1, name: 'image_002.jpg', url: 'https://picsum.photos/seed/ds2/600/400' },
  { id: 3, projectId: 1, name: 'image_003.jpg', url: 'https://picsum.photos/seed/ds3/600/400' },
  { id: 4, projectId: 2, name: 'image_004.jpg', url: 'https://picsum.photos/seed/ds4/600/400' },
  { id: 5, projectId: 2, name: 'image_005.jpg', url: 'https://picsum.photos/seed/ds5/600/400' },
  { id: 6, projectId: 3, name: 'image_006.jpg', url: 'https://picsum.photos/seed/ds6/600/400' },
];
let nextId = 7;

export const getDatasetsByProject = (projectId: number): Promise<Dataset[]> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(datasets.filter((d) => d.projectId === projectId)), 300)
  );

export const getDatasetsByIds = (ids: number[]): Promise<Dataset[]> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(datasets.filter((d) => ids.includes(d.id))), 300)
  );

export const deleteDataset = (id: number): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(() => {
      datasets = datasets.filter((d) => d.id !== id);
      resolve();
    }, 300)
  );

export const uploadDataset = (projectId: number, files: File[]): Promise<Dataset[]> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const created: Dataset[] = files.map((file) => ({
        id: nextId++,
        projectId,
        name: file.name,
        url: URL.createObjectURL(file),
      }));
      datasets.push(...created);
      resolve(created);
    }, 300)
  );
