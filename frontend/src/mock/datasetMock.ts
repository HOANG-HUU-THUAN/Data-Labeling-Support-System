import type { Dataset } from '../types/dataset';

let datasets: Dataset[] = [];
let nextId = 1;

export const getDatasetsByProject = (projectId: number): Promise<Dataset[]> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(datasets.filter((d) => d.projectId === projectId)), 300)
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
