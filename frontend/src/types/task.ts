export interface Task {
  id: number;
  projectId: number;
  name: string;
  datasetIds: number[];
  status: TaskStatus;
  assigneeId?: number;
}

export interface MyTask {
  taskId: number;
  projectId: number;
  projectName: string;
  status: TaskStatus;
  assignedAnnotatorId: number;
  assignedReviewerId: number;
  imageCount: number;
  createdAt: string;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface AnnotationImage {
  id: number;
  name: string;
  url: string;
}
