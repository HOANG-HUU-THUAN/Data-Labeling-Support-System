import { getTasks } from './taskMock';
import type { Task } from '../types/task';

const USER_NAMES: Record<number, string> = {
  1: 'Admin',
  2: 'Manager',
  3: 'Annotator',
  4: 'Reviewer',
};

export const getAssigneeName = (assigneeId?: number): string => {
  if (!assigneeId) return '—';
  return USER_NAMES[assigneeId] ?? `User #${assigneeId}`;
};

export const getReviewTasks = (): Promise<Task[]> =>
  new Promise((resolve) =>
    setTimeout(() => {
      getTasks().then((tasks) => resolve(tasks.filter((t) => t.status === 'SUBMITTED')));
    }, 300)
  );
