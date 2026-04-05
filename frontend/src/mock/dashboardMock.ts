import { getTasks } from './taskMock';
import { getUsers } from './userMock';
import type { TaskStatus } from '../types/task';
import type { UserPerformance } from '../types/performance';

export type { UserPerformance };

export interface ProjectStats {
  totalImages: number;
  annotated: number;
  approved: number;
  rejected: number;
}

export interface ProgressItem {
  status: TaskStatus;
  count: number;
}

export const getProjectStats = (projectId?: number): Promise<ProjectStats> =>
  getTasks().then((tasks) => {
    const t = projectId != null ? tasks.filter((x) => x.projectId === projectId) : tasks;
    const total = t.length;
    const approved = t.filter((x) => x.status === 'APPROVED').length;
    const rejected = t.filter((x) => x.status === 'REJECTED').length;
    const annotated = t.filter((x) =>
      ['IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(x.status)
    ).length;
    return { totalImages: total, annotated, approved, rejected };
  });

export const getProjectProgress = (projectId?: number): Promise<ProgressItem[]> =>
  getTasks().then((tasks) => {
    const t = projectId != null ? tasks.filter((x) => x.projectId === projectId) : tasks;
    const ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'];
    const counts: Partial<Record<TaskStatus, number>> = {};
    for (const x of t) counts[x.status] = (counts[x.status] ?? 0) + 1;
    return ORDER.filter((s) => (counts[s] ?? 0) > 0).map((status) => ({ status, count: counts[status]! }));
  });

export const getUserPerformance = (): Promise<UserPerformance[]> =>
  Promise.all([getTasks(), getUsers()]).then(([tasks, users]) => {
    const annotators = users.filter((u) => u.role === 'ANNOTATOR' && !u.isLocked);
    return annotators.map((u) => {
      const myTasks = tasks.filter((t) => t.assigneeId === u.id);
      const inWork = ['IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'] as TaskStatus[];
      return {
        userId: u.id,
        name: u.name,
        annotated: myTasks.filter((t) => inWork.includes(t.status)).length,
        approved: myTasks.filter((t) => t.status === 'APPROVED').length,
        rejected: myTasks.filter((t) => t.status === 'REJECTED').length,
      };
    });
  });
