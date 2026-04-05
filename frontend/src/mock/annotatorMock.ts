import { getTaskById } from './taskMock';
import { getTasks } from './taskMock';
import { getDatasetsByIds } from './datasetMock';
import type { Task } from '../types/task';

export interface AnnotationImage {
  id: number;
  name: string;
  url: string;
}

export const getMyTasks = (userId: number): Promise<Task[]> =>
  getTasks().then((all) => all.filter((t) => t.assigneeId === userId));

export const getTaskImages = (taskId: number): Promise<AnnotationImage[]> =>
  getTaskById(taskId).then((task) => {
    if (!task || task.datasetIds.length === 0) return [];
    return getDatasetsByIds(task.datasetIds).then((datasets) =>
      datasets.map((d) => ({ id: d.id, name: d.name, url: d.url }))
    );
  });
