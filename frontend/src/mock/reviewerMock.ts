import { getTasks, getTaskById, updateTaskStatus, rejectTaskData } from './taskMock';
import { getTaskImages } from './annotatorMock';
import { getAnnotationsByImage } from './annotationMock';
import { getLabelsByProject } from './labelMock';
import type { Task } from '../types/task';
import type { Annotation } from '../types/annotation';
import type { Label } from '../types/label';
import type { AnnotationImage } from './annotatorMock';

const USER_NAMES: Record<number, string> = {
  1: 'Admin',
  2: 'Manager',
  3: 'Annotator',
  4: 'Reviewer',
};

export interface ReviewResult {
  comment: string;
  errorType: string;
}

const reviewResults: Record<number, ReviewResult> = {};

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

export const approveTask = (taskId: number): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(() => {
      updateTaskStatus(taskId, 'APPROVED').then(() => resolve());
    }, 300)
  );

export const rejectTask = (
  taskId: number,
  payload: ReviewResult
): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(() => {
      reviewResults[taskId] = payload;
      rejectTaskData(taskId, payload.comment, payload.errorType).then(() => resolve());
    }, 300)
  );

export interface ReviewTaskDetail {
  task: Task;
  images: AnnotationImage[];
  annotations: Annotation[];
  labels: Label[];
}

export const getReviewTaskDetail = (taskId: number): Promise<ReviewTaskDetail> =>
  getTaskById(taskId).then((task) => {
    if (!task) return Promise.reject(new Error('Task not found'));
    return Promise.all([
      getTaskImages(taskId),
      getLabelsByProject(task.projectId),
    ]).then(([images, labels]) =>
      Promise.all(images.map((img) => getAnnotationsByImage(img.id))).then(
        (annotationArrays) => ({
          task,
          images,
          annotations: annotationArrays.flat(),
          labels,
        })
      )
    );
  });

