import type { Task } from '../types/task';

let tasks: Task[] = [
  { id: 1, projectId: 1, name: 'Gán nhãn ảnh batch 1', status: 'TODO', assigneeId: 3 },
  { id: 2, projectId: 1, name: 'Gán nhãn ảnh batch 2', status: 'IN_PROGRESS', assigneeId: 3 },
  { id: 3, projectId: 2, name: 'Kiểm tra nhãn dataset A', status: 'SUBMITTED', assigneeId: 3 },
  { id: 4, projectId: 2, name: 'Review kết quả gán nhãn', status: 'APPROVED' },
  { id: 5, projectId: 3, name: 'Gán nhãn ảnh y tế', status: 'REJECTED', assigneeId: 3 },
];

let nextId = tasks.length + 1;

export const getTasks = (): Promise<Task[]> =>
  new Promise((resolve) => setTimeout(() => resolve([...tasks]), 300));

export const deleteTask = (id: number): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(() => {
      tasks = tasks.filter((t) => t.id !== id);
      resolve();
    }, 300)
  );
