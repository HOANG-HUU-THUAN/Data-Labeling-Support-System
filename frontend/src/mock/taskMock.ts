import type { Task } from '../types/task';

let tasks: Task[] = [
  { id: 1, projectId: 1, name: 'Gán nhãn ảnh batch 1', datasetIds: [1, 2], status: 'TODO', assigneeId: 3 },
  { id: 2, projectId: 1, name: 'Gán nhãn ảnh batch 2', datasetIds: [3], status: 'IN_PROGRESS', assigneeId: 3 },
  { id: 3, projectId: 1, name: 'Gán nhãn ảnh batch 3', datasetIds: [], status: 'SUBMITTED', assigneeId: 3 },
  { id: 4, projectId: 1, name: 'Gán nhãn ảnh batch 4', datasetIds: [], status: 'APPROVED', assigneeId: 3 },
  { id: 5, projectId: 1, name: 'Gán nhãn ảnh batch 5', datasetIds: [], status: 'APPROVED', assigneeId: 3 },
  { id: 6, projectId: 2, name: 'Kiểm tra nhãn dataset A', datasetIds: [], status: 'SUBMITTED', assigneeId: 3 },
  { id: 7, projectId: 2, name: 'Review kết quả gán nhãn', datasetIds: [], status: 'APPROVED' },
  { id: 8, projectId: 2, name: 'Gán nhãn dataset B', datasetIds: [], status: 'REJECTED', assigneeId: 3 },
  { id: 9, projectId: 3, name: 'Gán nhãn ảnh y tế 1', datasetIds: [], status: 'APPROVED', assigneeId: 3 },
  { id: 10, projectId: 3, name: 'Gán nhãn ảnh y tế 2', datasetIds: [], status: 'REJECTED', assigneeId: 3, reviewComment: 'Nhãn bị chọn sai, cần kiểm tra lại.', errorType: 'Sai nhãn' },
];

let nextId = tasks.length + 1;

export const getTasks = (): Promise<Task[]> =>
  new Promise((resolve) => setTimeout(() => resolve([...tasks]), 300));

export const getTaskById = (id: number): Promise<Task | undefined> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(tasks.find((t) => t.id === id)), 300)
  );

export const createTask = (data: {
  name: string;
  projectId: number;
  datasetIds: number[];
  assigneeId?: number;
}): Promise<Task> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const task: Task = { ...data, id: nextId++, status: 'TODO' };
      tasks.push(task);
      resolve(task);
    }, 300)
  );

export const deleteTask = (id: number): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      resolve();
    }, 300)
  );

export const updateTask = (
  id: number,
  data: { name: string; datasetIds: number[]; assigneeId?: number }
): Promise<Task> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) { reject(new Error('Task not found')); return; }
      tasks[idx] = { ...tasks[idx], ...data };
      resolve({ ...tasks[idx] });
    }, 300)
  );

export const assignTask = (id: number, assigneeId: number | undefined): Promise<Task> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) { reject(new Error('Task not found')); return; }
      tasks[idx] = { ...tasks[idx], assigneeId };
      resolve({ ...tasks[idx] });
    }, 300)
  );

export const updateTaskStatus = (id: number, status: Task['status']): Promise<Task> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) { reject(new Error('Task not found')); return; }
      tasks[idx] = { ...tasks[idx], status };
      resolve({ ...tasks[idx] });
    }, 300)
  );

export const rejectTaskData = (
  id: number,
  reviewComment: string,
  errorType: string,
): Promise<Task> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) { reject(new Error('Task not found')); return; }
      tasks[idx] = { ...tasks[idx], status: 'REJECTED', reviewComment, errorType };
      resolve({ ...tasks[idx] });
    }, 300)
  );

export const submitTask = (id: number): Promise<Task> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) { reject(new Error('Task not found')); return; }
      tasks[idx] = { ...tasks[idx], status: 'SUBMITTED' };
      resolve({ ...tasks[idx] });
    }, 300)
  );
